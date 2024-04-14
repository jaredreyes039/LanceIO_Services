const express = require('express');
const ROUTER = express.Router();
const CLIENT_CONTACTS_CONTROLLER = require('../controllers/clientContacts.controller');
const multer = require('multer');
const path = require('path');

const storeEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null,`${file.originalname}`)
    }
})

const checkFileType = function (file, cb) {
    //Allowed file extensions
    const fileTypes = /jpeg|jpg|png|gif|svg/;
  
    //check extension names
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  
    const mimeType = fileTypes.test(file.mimetype);
  
    if (mimeType && extName) {
      return cb(null, true);
    } else {
      cb("Error: You can Only Upload Images!!");
    }
  };

const upload = multer({
    storage: storeEngine,
    limits: {fileSize: 100000000},
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
      }})


ROUTER.post('/addContact' ,CLIENT_CONTACTS_CONTROLLER.addClientContact);
ROUTER.post('/addContactLogo', upload.single('file'), (req, res)=>{
    console.log(req);
    res.send(req.file);
});
ROUTER.get('/getContact/:user_id', CLIENT_CONTACTS_CONTROLLER.getContactsByUserId);

module.exports = ROUTER;
