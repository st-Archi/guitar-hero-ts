// ==========================================
// ESTADO 1: PANTALLA DE INICIO
// ==========================================
class StartScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScreen' });
    }

    create() {
        this.add.text(400, 200, 'RHYTHM HERO', {
            fontSize: '64px', fontStyle: 'bold', color: '#00ffcc'
        }).setOrigin(0.5);

        this.add.text(400, 280, 'Track: FE!N - Travis Scott', {
            fontSize: '24px', color: '#ffffff'
        }).setOrigin(0.5);

        const playButton = this.add.text(400, 420, '[ CLICK PARA JUGAR ]', {
            fontSize: '32px', color: '#ff0055'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        playButton.on('pointerover', () => playButton.setColor('#ffffff'));
        playButton.on('pointerout', () => playButton.setColor('#ff0055'));

        playButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}

// ==========================================
// ESTADO 2: MENÚ DE PAUSA
// ==========================================
class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create() {
        // Fondo semitransparente
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);

        this.add.text(400, 150, 'PAUSA', {
            fontSize: '52px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5);

        // --- BOTÓN RESUMIR ---
        const resumeBtn = this.add.text(400, 280, 'RESUMIR', { fontSize: '32px', color: '#00ffcc' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        resumeBtn.on('pointerdown', () => {
            this.scene.resume('GameScene'); 
            this.scene.stop();              
        });

        // --- BOTÓN REINICIAR ---
        const restartBtn = this.add.text(400, 360, 'REINICIAR CANCIÓN', { fontSize: '32px', color: '#ffffff' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true });

        restartBtn.on('pointerdown', () => {
            const gameScene = this.scene.get('GameScene');
            gameScene.music.stop();         
            this.scene.start('GameScene');  
        });

        // --- BOTÓN SALIR ---
        const exitBtn = this.add.text(400, 440, 'SALIR AL MENÚ', { fontSize: '32px', color: '#ff0055' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true });

        exitBtn.on('pointerdown', () => {
            const gameScene = this.scene.get('GameScene');
            gameScene.music.stop();
            this.scene.start('StartScreen'); 
        });

        // Efectos hover
        [resumeBtn, restartBtn, exitBtn].forEach(btn => {
            btn.on('pointerover', () => btn.setScale(1.1));
            btn.on('pointerout', () => btn.setScale(1));
        });
    }
}

// ==========================================
// ESTADO 3: JUEGO (LA AUTOPISTA)
// ==========================================
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        let loadingText = this.add.text(400, 300, 'Cargando Assets...', { color: '#ffffff' }).setOrigin(0.5);
        this.load.on('complete', () => loadingText.destroy());

        let version = Date.now(); 
        this.load.json('chart', 'map.json');
        this.load.audio('song', 'fein.mp3');
        // ¡ESTA LÍNEA ES VITAL!
        this.load.video('bg_video', 'fein_bg.mp4');
    }

    create() {
        // ====================================================
        // 1. EL VIDEO DE FONDO (CAPA BASE)
        // ====================================================
        this.backgroundVideo = this.add.video(400, 300, 'bg_video');
        this.backgroundVideo.setAlpha(1); // Video con todo su brillo
        this.backgroundVideo.setMute(true); // Silenciado para que no choque con fein.mp3
        
        // Magia matemática: Escalar el video dinámicamente para que cubra los bordes negros
        this.backgroundVideo.on('play', () => {
            // CORRECCIÓN: Phaser 3 usa directamente .width y .height
            let scaleX = 800 / this.backgroundVideo.width;
            let scaleY = 600 / this.backgroundVideo.height;
            let finalScale = Math.max(scaleX, scaleY); 
            this.backgroundVideo.setScale(finalScale);
        });

        // ====================================================
        // 2. LA AUTOPISTA (Cristal semitransparente)
        // ====================================================
        // Pista negra (0x000000) al 50% de opacidad (0.5) para ver el video debajo
        this.add.rectangle(400, 300, 400, 600, 0x000000, 0.5); 

        // ====================================================
        // 3. VARIABLES DE ESTADO Y FÍSICAS
        // ====================================================
        this.score = 0;
        this.hitWindow = 100; // Tolerancia de 100ms
        this.targetY = 500;   // Coordenada Y de la meta
        this.noteSpeed = 0.5; // Píxeles por milisegundo
        this.spawnY = 0;      // Coordenada Y de nacimiento de las notas
        
        // Interfaz de Puntaje
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', { 
            fontSize: '32px', 
            fontStyle: 'bold', 
            color: '#ffffff' 
        });

        const laneX = [250, 350, 450, 550]; 
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00]; 

        // ====================================================
        // 4. RECEPTORES Y TECLADO
        // ====================================================
        this.hitZones = [];
        for (let i = 0; i < 4; i++) {
            let zone = this.add.rectangle(laneX[i], this.targetY, 80, 20, colors[i], 0.3);
            zone.setStrokeStyle(2, colors[i]);
            this.hitZones.push(zone);
        }

        // Configuración de teclas (A, S, D, F)
        this.keys = this.input.keyboard.addKeys({
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            F: Phaser.Input.Keyboard.KeyCodes.F
        });

        this.setupInputFeedback(this.keys.A, this.hitZones[0], colors[0], 0);
        this.setupInputFeedback(this.keys.S, this.hitZones[1], colors[1], 1);
        this.setupInputFeedback(this.keys.D, this.hitZones[2], colors[2], 2);
        this.setupInputFeedback(this.keys.F, this.hitZones[3], colors[3], 3);

        this.notes = this.add.group();

        // ====================================================
        // 5. LÓGICA DE PAUSA (Audio y Video)
        // ====================================================
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        this.escKey.on('down', () => {
            this.scene.pause();              
            this.music.pause();
            this.backgroundVideo.pause(); // Pausar video de fondo
            this.scene.launch('PauseScene'); 
        });

        this.events.on('resume', () => {
            this.music.resume(); 
            this.backgroundVideo.resume(); // Reanudar video de fondo
        });

        // ====================================================
        // 6. INICIAR REPRODUCCIÓN (Reloj Maestro)
        // ====================================================
        this.music = this.sound.add('song');
        this.upcomingNotes = [...this.cache.json.get('chart')]; 
        
        this.laneXCoords = laneX;
        this.laneColors = colors;

        // Arrancamos ambos canales simultáneamente
        this.music.play();
        this.backgroundVideo.play();
    }

    setupInputFeedback(key, zone, color, laneIndex) {
        key.on('down', () => {
            zone.setFillStyle(color, 0.9);
            this.checkHit(laneIndex);      
        });
        key.on('up', () => zone.setFillStyle(color, 0.3));
    }

    checkHit(laneIndex) {
        let hitSuccessful = false;
        let currentAudioTime = this.music.seek * 1000; 

        this.notes.getChildren().forEach(note => {
            if (hitSuccessful) return;

            if (note.getData('lane') === laneIndex) {
                let targetTime = note.getData('targetTime');
                let timeDifference = Math.abs(targetTime - currentAudioTime);

                // Si acertó la nota...
                if (timeDifference <= this.hitWindow) {
                    this.updateScore(100); // Sumamos 100 puntos
                    note.destroy();
                    hitSuccessful = true;
                }
            }
        });

        // NUEVO: Si terminó de revisar todas las notas y no le atinó a nada...
        if (!hitSuccessful) {
            this.updateScore(-50); // Castigo por presionar a destiempo o equivocarse de tecla
        }
    }

    update() {
        if (!this.music.isPlaying) return;

        let currentAudioTime = this.music.seek * 1000;
        let travelTimeMs = (this.targetY - this.spawnY) / this.noteSpeed;

        // Generador de notas (Spawning)
        while (this.upcomingNotes.length > 0) {
            let nextNote = this.upcomingNotes[0];
            
            if (nextNote.time - travelTimeMs <= currentAudioTime) {
                let noteData = this.upcomingNotes.shift();
                this.spawnNoteFromData(noteData);
            } else {
                break; 
            }
        }

        // Interpolación (Movimiento exacto basado en el audio)
        // 5. MOTOR DE INTERPOLACIÓN (Movimiento Perfecto)
        this.notes.getChildren().forEach(note => {
            let targetTime = note.getData('targetTime');
            let timeUntilHit = targetTime - currentAudioTime;

            note.y = this.targetY - (timeUntilHit * this.noteSpeed);

            // Si la nota pasó la meta y salió de la ventana de tolerancia (Miss)
            // Usamos -200ms para darle un margen visual antes de desaparecerla
            if (timeUntilHit < -200) {
                this.updateScore(-50); // Castigo por dejarla pasar
                note.destroy();
            }
        });
    }

    spawnNoteFromData(noteData) {
        let lIndex = noteData.lane;
        let note = this.add.rectangle(this.laneXCoords[lIndex], this.spawnY, 80, 30, this.laneColors[lIndex]);
        
        note.setData('lane', lIndex);
        note.setData('targetTime', noteData.time);
        
        this.notes.add(note);
    }

    // NUEVA FUNCIÓN: Manejador centralizado del puntaje
    updateScore(amount) {
        // Sumamos o restamos, pero evitamos que baje de 0
        this.score = Math.max(0, this.score + amount);
        this.scoreText.setText('SCORE: ' + this.score);

        // Feedback visual rápido: Si restamos, el texto parpadea en rojo
        if (amount < 0) {
            this.scoreText.setColor('#ff0000'); // Rojo
            this.time.delayedCall(200, () => {
                this.scoreText.setColor('#ffffff'); // Vuelve a blanco en 200ms
            });
        }
    }
}

// ==========================================
// CONFIGURACIÓN DEL MOTOR
// ==========================================
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    scene: [StartScreen, GameScene, PauseScene] // Añadimos PauseScene aquí
};

const game = new Phaser.Game(config);