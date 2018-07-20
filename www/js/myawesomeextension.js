// *******************************************
// My Awesome Extension
// *******************************************
import { FileLoader } from './node_modules/three-full/loaders/FileLoader.js'
// import { Ocean } from 'node_modules/three-full/sources/Ocean'

function MyAwesomeExtension(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);
}

MyAwesomeExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
MyAwesomeExtension.prototype.constructor = MyAwesomeExtension;

MyAwesomeExtension.prototype.load = function () {
  if (this.viewer.toolbar) {
    // Toolbar is already available, create the UI
    this.createUI();
  } else {
    // Toolbar hasn't been created yet, wait until we get notification of its creation
    this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
    this.viewer.addEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
  }
  return true;
};

MyAwesomeExtension.prototype.onToolbarCreated = function () {
  this.viewer.removeEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
  this.onToolbarCreatedBinded = null;
  this.createUI();
};

MyAwesomeExtension.prototype.createUI = function () {
  var _this = this;

  // prepare to execute the button action
  var myAwesomeToolbarButton = new Autodesk.Viewing.UI.Button('runMyAwesomeCode');
  myAwesomeToolbarButton.onClick = function (e) {
    
    console.log(_this.viewer);

		var particle_size = 0.03; // 0.01 for github Dambreak | 0.005 for gearbox | 0.1 for fluid | propeller = 0.01
		var colormap_min = -1;  // min for Lookup Table [m/s]
		var colormap_max = 1;   // max for Lookup Table [m/s]
		// var filename = 'gearbox/gearbox_460.csv'       //  github datastorage
		var filename = 'propeller/propeller_400.csv'   //  github data storage
		// var filename = 'fluid.csv'					   //  amazon S3 (don't use for testing) 

		THREE.Cache.enabled = true;
    var loader = new THREE.FileLoader();
		loader.load('https://raw.githubusercontent.com/jobi2122/datastorage/master/' + filename, function (data) {
		// loader.load('https://s3.eu-central-1.amazonaws.com/dive.webprototype/' + filename, function (data) {

			// camera = new THREE.PerspectiveCamera( 60, WIDTH / HEIGHT, 0.01, 1000);
			// camera.position.set(-0.2,0,0);  // sets camera position to (x,y,z)
			// camera.position.set(0.3082069898459656, 0.24554753263083912, 0.11561752355142028) // gearbox
			// camera.position.set(1,1,1)
			// camera.lookAt(0,0,0);
			// camera.up.set(0,0,1);

			// scene = new THREE.Scene();

			pointGeometry = new THREE.Geometry();
		  var positions = [];
			var velocities = [];
			var attributes;
			var particles = data.split(/\n/g);
			for ( var i = 0; i < particles.length; i++) {
				attributes = particles[i].split(",");
				velocities.push(new THREE.Vector3(
					parseFloat(attributes[0]), 
					parseFloat(attributes[1]), 
					parseFloat(attributes[2]))
				);
            	positions.push(new THREE.Vector3( 
            		parseFloat(attributes[3]), 
            		parseFloat(attributes[4]),
            		parseFloat(attributes[5]))
				);
			};
    		pointGeometry.vertices = positions;
			// console.log(positions);
			// console.log(velocities);
			var positions = new Float32Array( pointGeometry.vertices.length * 3 );
			var colors = new Float32Array( pointGeometry.vertices.length * 3 );
			var sizes = new Float32Array( pointGeometry.vertices.length );
			var vertex;
			var color = new THREE.Color();

			var lut = new THREE.Lut("rainbow", 255);
			lut.setMax(colormap_max);
			lut.setMin(colormap_min);
			
			for ( var i = 0; i < pointGeometry.vertices.length; i ++ ) {
				vertex = pointGeometry.vertices[ i ];
				vertex.toArray( positions, i * 3 );
				// color.setHSL( 0.6, 1, velocities[10].x / 2.8 );
				color = lut.getColor(velocities[i].x);
				color.toArray( colors, i * 3 );
    	    }
			var geometry = new THREE.BufferGeometry();
			geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
			geometry.addAttribute( 'ca', new THREE.BufferAttribute( colors, 3 ) );
			geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
			for  (var i = 0; i < geometry.attributes.size.array.length; i++){
				geometry.attributes.size.array[i] = particle_size;  // particle size
			}
			var texture = new THREE.TextureLoader().load("https://raw.githubusercontent.com/mrdoob/three.js/feefe06713cd6b44baaf5de8e58234a100275c8d/examples/textures/sprites/ball.png" );
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			var material = new THREE.ShaderMaterial( {
				uniforms: {
					amplitude: { value: 1 },
					color:     { value: new THREE.Color( 0xffffff ) },
					texture:   { value: texture }
				},
				vertexShader:   document.getElementById( 'vertexshader' ).textContent,
				fragmentShader: document.getElementById( 'fragmentshader' ).textContent
			});
			object = new THREE.Points( geometry, material );
      
      
      _this.viewer.impl.scene.add(object);
      _this.viewer.impl.invalidate(true);
  
      // scene.add( object );
			// renderer = new THREE.WebGLRenderer({antialias: true});
			// renderer.setPixelRatio( window.devicePixelRatio );
			// renderer.setSize( WIDTH, HEIGHT );
			// renderer.setClearColor( 0xECF0F1  , 1 );

			// var container = document.getElementById( 'container' );
			// container.appendChild( renderer.domElement );
			
			/////////    CONTROLS   /////////
			// let controls = new THREE.TrackballControls(camera, renderer.domElement);
			// controls.rotateSpeed = 1.5;
			// controls.zoomSpeed = 1.2;
			// controls.panSpeed = 0.8;
			// controls.noZoom = false;
			// controls.noPan = false;
			// controls.staticMoving = true;
			// controls.dynamicDampingFactor = 0.3;
			// object.geometry.computeBoundingSphere();
			// console.log(object.geometry.boundingSphere.center);        //calculate center of object 
			// var object_center = object.geometry.boundingSphere.center;
			// controls.target.set(object_center.x, object_center.y, object_center.z);//set center as rotation center for trackball controls


			// stats = new Stats();
			// container.appendChild( stats.dom );
			// window.addEventListener( 'resize', onWindowResize, false );
			// animate();

			// function onWindowResize() {
			// 	camera.aspect = window.innerWidth / window.innerHeight;
			// 	camera.updateProjectionMatrix();
			// 	renderer.setSize( window.innerWidth, window.innerHeight );
			// 	console.log(camera.position)
			// }

			// function animate() {
			// 	requestAnimationFrame( animate );
			// 	render();
			// 	stats.update();
			// }

			// function render() {
			// 	var time = Date.now() * 0.01;
			// 	controls.update();
			// 	// object.rotatikon.y = object.rotation.z = 0.01 * time;
			// 	renderer.render( scene, camera );
			// }
		},
    	    function ( xhr ) {console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},
			function ( err ) {console.error( 'An error happened' );}
		)


    //add two spheres to scene
    // _this.viewer.impl.scene.add(plane);
    // // _this.viewer.impl.scene.add(sphere_minpt);

    // _this.viewer.impl.invalidate(true);

    alert('I am an extension');
  };
  // myAwesomeToolbarButton CSS class should be defined on your .css file
  // you may include icons, below is a sample class:
  myAwesomeToolbarButton.addClass('myAwesomeToolbarButton');
  myAwesomeToolbarButton.setToolTip('My Awesome extension');

  // SubToolbar
  this.subToolbar = (this.viewer.toolbar.getControl("MyAppToolbar") ?
    this.viewer.toolbar.getControl("MyAppToolbar") :
    new Autodesk.Viewing.UI.ControlGroup('MyAppToolbar'));
  this.subToolbar.addControl(myAwesomeToolbarButton);

  this.viewer.toolbar.addControl(this.subToolbar);
};

MyAwesomeExtension.prototype.unload = function () {
  this.viewer.toolbar.removeControl(this.subToolbar);
  return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('MyAwesomeExtension', MyAwesomeExtension);