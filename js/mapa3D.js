
var poseMapa;

function mapa(args) {
	
	var mapa = document.getElementById("mapa");
	
	var stats = new Stats();
	stats.setMode( 1 ); // 0: fps, 1: ms, 2: mb

	// align top-left
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	
	document.body.appendChild( stats.domElement );

	// Escena
	var scene = new THREE.Scene();
	
	//Camara
	var camera = new THREE.PerspectiveCamera( 45, mapa.width/mapa.height, 0.1, 1000 );
	camera.up.set( 0, 0, 1 );
	camera.position.set( 23, 27, 18 );
	camera.lookAt( new THREE.Vector3( 0, 0, 0 )  );
	
	// Ejes
	var axis = new THREE.AxisHelper(3);//The X axis is red. The Y axis is green. The Z axis is blue.
	scene.add( axis );
	
	// Renderer
	var renderer = new THREE.WebGLRenderer( {canvas: mapa, alpha: true, antialias: true } );
	renderer.setSize( mapa.width, mapa.height );
	renderer.setClearColor( 0x000000, 0);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;
	document.body.appendChild( renderer.domElement );
	
	// PAra indicar donde esa el drone, la geometria, el matrial y el elemento cubo
	var sphereGeometry = new THREE.SphereGeometry( 1, 24, 2 );
	var sphereMaterial = new THREE.MeshLambertMaterial( {color: 0x399a00} ); //, side:THREE.DoubleSide
	var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	sphere.castShadow = true;
	sphere.receiveShadow = false;
	sphere.rotation.x = -0.5*Math.PI;
	scene.add( sphere );
	
	// Suelo. Si encuento algo mejor lo quito
	var planeGeometry = new THREE.PlaneGeometry( 40, 40);
	var planeMaterial = new THREE.MeshLambertMaterial( {color: 0xcccccc} );
	var plane = new THREE.Mesh( planeGeometry, planeMaterial );
	plane.position.x = 0;
	plane.position.y = 0;
	plane.position.z = 0;
	plane.castShadow = false;
	plane.receiveShadow = true;
	scene.add( plane );
	
	// Para indicar la posicion inicial del Drone
	var material = new THREE.MeshLambertMaterial( {color: 0xFFBF00} );
	var circleGeometry = new THREE.CircleGeometry( 0.5, 128 );
	var circle = new THREE.Mesh( circleGeometry, material );
	circle.receiveShadow = true;
	circle.castShadow = false;
	scene.add( circle );
	
	
	var spotLight = new THREE.SpotLight(0xffffff);
	spotLight.position.set(0, 0, 120);
	spotLight.castShadow = true;
	scene.add( spotLight);
	
	var spotLightHelper = new THREE.SpotLightHelper( spotLight );
	scene.add( spotLightHelper );
	



	
	var render = function () {
		stats.begin();
		if (poseMapa == undefined) {
			sphere.position.x = 0;
			sphere.position.y = 0
			sphere.position.z = 0;
		}else {
			sphere.position.x = poseMapa.x;
			sphere.position.y = poseMapa.y;
			sphere.position.z = poseMapa.z;
			panelControl.updatePanelControl(navdata, poseMapa);
		}

		renderer.render(scene, camera);
		//ACtualizo con requestAnimationFrame los relojes de los sensores

		stats.end();
		requestAnimationFrame( render );
	};
	
	render();
}

