const express = require('express');
const {
    createFile,
    getProjectFiles,
    updateFile,
    deleteFile
} = require('../controllers/fileController');

const router = express.Router();

router.post('/', createFile);
router.get('/:projectId', getProjectFiles);
router.patch('/:fileId', updateFile);
router.delete('/:fileId', deleteFile);

module.exports = router;
