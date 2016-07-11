/**********************************************
Código perteneciente al Trabajo Fin de Grado:
MANEJO DE UN DRONE CON WEBRTC Y JDEROBOT

Autor: Iván Rodríguez-Bobada Martín
      ivan7688[at]gmail[dot]com
Tutor: Jose María Cañas Plaza
      josemaria[dot]plaza[at]gmail[dot]com
Wiki: http://jderobot.org/Irodmar-tfg
**********************************************/


function mapa() {
	
	var mapa = document.getElementById("mapa");
	mapa.style.width = '30%';
	mapa.style.height = '25%';
	
	var stats = new Stats();
	stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb

	// align top-left
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.right = '0px';
	stats.domElement.style.top = '0px';
	
	document.body.appendChild( stats.domElement );

	// Escena
	var scene = new THREE.Scene();
	
	//Camara
	var camera = new THREE.PerspectiveCamera( 45, mapa.width/mapa.height, 0.1, 1000 );
	camera.up.set( 0, 0, 1 );
	camera.position.set( 18,20, 18 );
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
	

	
	// Suelo. 
	var planeGeometry = new THREE.PlaneGeometry( 40, 40);
	var planeMaterial = new THREE.MeshLambertMaterial( {color: 0xcccccc} );
	var plane = new THREE.Mesh( planeGeometry, planeMaterial );
	plane.position.x = 0;
	plane.position.y = 0;
	plane.position.z = 0;
	plane.castShadow = false;
	plane.receiveShadow = true;
	scene.add( plane );
	
	// Cuadricula en el suelo para mejorar la situacion del drone
	var gridHelper = new THREE.GridHelper( 20, 1 );
	gridHelper.up.set(0, 0, 1);
	gridHelper.position.set(0, 0, 0);
	gridHelper.rotation.x=-0.5*Math.PI;
	scene.add( gridHelper );
	
	// Para indicar la posicion inicial del Drone
	var material = new THREE.MeshLambertMaterial( {color: 0xFFBF00} );
	var circleGeometry = new THREE.CircleGeometry( 0.5, 128 );
	var circle = new THREE.Mesh( circleGeometry, material );
	circle.receiveShadow = true;
	circle.castShadow = false;
	scene.add( circle );
	
	// Luces
	var spotLight = new THREE.SpotLight(0xffffff);
	spotLight.position.set(0, 0, 120);
	spotLight.castShadow = true;
	scene.add( spotLight);
	
	//var spotLightHelper = new THREE.SpotLightHelper( spotLight );
	//scene.add( spotLightHelper );
	
	//Drone mediante Collada
	var loader = new THREE.ColladaLoader();
	//loader.upAxis = 'Z';
	loader.load('./collada/quadrotor/quadrotor_4.dae', function ( collada ) {
		
		dae = collada.scene;
		
		dae.position.x = 0;
		dae.position.y = 0;
		dae.position.z = 1;
		dae.scale.x = dae.scale.y = dae.scale.z = 5;
        dae.updateMatrix();
	   
		daemesh = dae.children[0].children[0];
		daemesh.castShadow = true;
		daemesh.receiveShadow = true;
        
	    scene.add( dae );
		render();
	});


	
	var render = function () {
		stats.begin();
		if (pose == undefined) {
			dae.position.x = 0;
			dae.position.y = 0
			dae.position.z = 0;
		}else {
			dae.quaternion.set(pose.q1, pose.q2, pose.q3, pose.q0);
			dae.position.set(pose.x, pose.y, pose.z);
				
			panelControl.updatePanelControl(navdata, pose);// update sensors watchers
		}

		renderer.render(scene, camera);

		stats.end();
		requestAnimationFrame( render );
	};
	
}

