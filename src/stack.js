import * as THREE from 'three';
import {Animate} from './animate';

export default class Stack {

    constructor(element, debug) {
        this.tileStack = [];
        this.state = {};
        this.animator = new Animate();

        if (debug) this.DEBUG = true;

        this.setupEnvironment();
        this.setupRenderer();
        this.bind(element);
    }

    initState() {
        this.state.hue = Math.random();
        this.state.lightness = 0.60;
        this.state.tileCount = 0;
    }

    setupEnvironment() {
        this.initState();

        const aspectRatio = window.innerWidth / window.innerHeight;
        const width = 10, height = width / aspectRatio;

        this.scene = new THREE.Scene();

        // Axis
        if (this.DEBUG) this.scene.add(new THREE.AxisHelper(5));

        // Orthographic camera

        this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, -10, 1000);
        this.camera.position.set(0, 4, 5);
        this.camera.rotateX(-Math.PI / 6);
        this.scene.add(this.camera);

        // Lighting

        this.ambientLight = new THREE.AmbientLight(0xFFFFFF);
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.4);
        this.directionalLight.position.set(-1, 1, 0);
        this.scene.add(this.directionalLight);

        if (this.DEBUG) this.scene.add(new THREE.DirectionalLightHelper(this.directionalLight, 5));

        // Base tile
        this.addTile();
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.render();
    }

    bind(element) {
        element.appendChild(this.renderer.domElement);
        element.addEventListener('keydown', this.onInteraction.bind(this));
    }

    onInteraction(event) {
        if (event.key === " ") {
            this.addTile();
        }
    }

    render(timestamp) {
        requestAnimationFrame(this.render.bind(this));
        this.animator.animate(timestamp);
        this.renderer.render(this.scene, this.camera);
    }

    addTile(options) {

        options = options || {};

        // Compute new state

        this.state.hue += 0.02 + Math.random() * 0.02;
        this.state.lightness = 0.60 + Math.random() * 0.1 - 0.05;
        this.state.metalness = Math.random() * 0.3;
        this.state.roughness = 1 - Math.random() * 0.3;

        // Geometry

        const LENGTH = 1.5, BREADTH = 1.5, HEIGHT = 0.16;
        const geometry = new THREE.BoxGeometry(LENGTH, HEIGHT, BREADTH);

        // Material

        const SATURATION = 0.30;
        const color = new THREE.Color().setHSL(this.state.hue, SATURATION, this.state.lightness);

        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: this.state.metalness,
            roughness: this.state.roughness
        });

        // Create the tile

        const tile = new THREE.Mesh(geometry, material);
        this.tileStack.push(tile);
        this.scene.add(tile);

        // Update state parameters

        this.state.tileCount += 1;

        // Transform the tile

        tile.rotateY(Math.PI / 4);
        if (this.tileStack.length > 1) {
            tile.position.set(1, this.state.tileCount * HEIGHT, 0);
        } else {
            tile.position.set(0, this.state.tileCount * HEIGHT, 0)
        }

        // Animations

        if (this.tileStack.length > 1) {
            if(this.state.lastAnimation) this.animator.stopAnimation(this.state.lastAnimation);
            this.state.lastAnimation = this.animator.registerAnimation({
                target: this.tileStack[this.tileStack.length - 1].position,
                property: 'x',
                to: -1,
                duration: 1000,
                loop: Infinity,
                direction: 'alternate'
            });
        }

        this.animator.registerAnimation({
            target: this.camera.position,
            property: 'y',
            to: this.state.tileCount * HEIGHT + 4,
            duration: 1000
        });

        if (this.state.tileCount > 50) {
            this.scene.remove(this.tileStack.shift());
        }

        return tile;
    }
}