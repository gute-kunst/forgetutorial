// *******************************************
// My Awesome Extension
// *******************************************
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

    var material_red = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    _this.viewer.impl.matman().addMaterial('ADN-Material' + 'red', material_red, true);
    
    var material_green = new THREE.MeshPhongMaterial({ color: 0x00FF00 });
    _this.viewer.impl.matman().addMaterial('ADN-Material' + 'green', material_green,true);

    var boundingBox = _this.viewer.model.getBoundingBox();
    var maxpt = boundingBox.max;
    var minpt = boundingBox.min;

    var xdiff =    maxpt.x - minpt.x;
    var ydiff =    maxpt.y - minpt.y;
    var zdiff =    maxpt.z - minpt.z;  

    var niceRadius = Math.pow((xdiff * xdiff + ydiff * ydiff + zdiff * zdiff), 0.5) / 10;

    var sphere_maxpt = new THREE.Mesh( new THREE.SphereGeometry( niceRadius, 20), material_red);
    sphere_maxpt.position.set(maxpt.x, maxpt.y,maxpt.z);

    var sphere_minpt =  new THREE.Mesh( new THREE.SphereGeometry(niceRadius, 20), material_green)
    sphere_minpt.position.set(minpt.x, minpt.y, minpt.z);

    //add two spheres to scene
    _this.viewer.impl.scene.add(sphere_maxpt);
    _this.viewer.impl.scene.add(sphere_minpt);

    _this.viewer.impl.invalidate(true);
  // scene.add(plane);
  
  // var myViewer = viewerApp.getCurrentViewer();
  // console.log('before printing myviewer')
  // console.log(myViewer);

  // //3 - Third method
  // viewerApp.impl.createOverlayScene (
  // 'myOverlay', mat)

  // viewerApp.impl.addOverlay (
  // 'myOverlay', geo)

  // viewerApp.impl.invalidate (true)

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