const fs = require('fs');
const { Midi } = require('@tonejs/midi');

// 1. Leer el archivo MIDI que exportaste de Logic
const midiData = fs.readFileSync('fein.mid');
const midi = new Midi(midiData);

const songMap = [];

// 2. Diccionario de Teclas (Mapping)
// NOTA TÉCNICA: Logic Pro usa C3 como Do Central, pero el estándar 
// de Tone.js a veces lo lee como C4. Si el script no detecta notas, 
// cambia los 3 por 4 (ej. C4, D4, E4, F4).
const noteToLane = {
    'C3': 0, // Carril A
    'D3': 1, // Carril S
    'E3': 2, // Carril D
    'F3': 3  // Carril F
};

// 3. Extraer los datos
midi.tracks.forEach(track => {
    track.notes.forEach(note => {
        const lane = noteToLane[note.name];
        
        // Si la nota del MIDI coincide con nuestro diccionario, la guardamos
        if (lane !== undefined) {
            songMap.push({
                time: Math.round(note.time * 1000), // El juego funciona en milisegundos
                lane: lane
            });
        }
    });
});

// 4. Ordenar cronológicamente (Buena práctica de seguridad en datos)
songMap.sort((a, b) => a.time - b.time);

// 5. Crear el archivo JSON
fs.writeFileSync('map.json', JSON.stringify(songMap, null, 2));

console.log(`¡Conversión exitosa! Se guardaron ${songMap.length} notas en map.json`);