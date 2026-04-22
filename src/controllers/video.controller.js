const { Video, Empresa } = require('../models');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

exports.getAll = async (req, res) => {
    try {
        const videos = await Video.findAll();
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { nombre, empresa_id } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ningún video o archivo comprimido.' });
        }

        let videoUrl = `/uploads/${req.file.filename}`;
        const ext = path.extname(req.file.originalname).toLowerCase();

        // Lógica de descompresión si es un ZIP
        if (ext === '.zip') {
            const zip = new AdmZip(req.file.path);
            const zipEntries = zip.getEntries();
            const videoEntry = zipEntries.find(entry => entry.entryName.toLowerCase().endsWith('.mp4'));

            if (videoEntry) {
                const newFilename = `${Date.now()}-${videoEntry.entryName}`;
                zip.extractEntryTo(videoEntry, 'uploads/', false, true, newFilename);
                videoUrl = `/uploads/${newFilename}`;
                // Opcional: borrar el zip original
                fs.unlinkSync(req.file.path);
            }
        }

        const video = await Video.create({
            nombre: nombre || req.file.originalname,
            url: videoUrl,
            empresa_id,
            status: true
        });

        res.status(201).json(video);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const video = await Video.findByPk(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video no encontrado' });
        await video.destroy();
        res.json({ message: 'Video eliminado (soft delete)' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
