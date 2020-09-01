/**
 * File uploader with drag and drop
 * @see https://css-tricks.com/drag-and-drop-file-uploading/
 * 
 * @events
 * * rivets:file-upload:uploaded (event, file)
 * * rivets:file-upload:complete (event, files)
 */
rivets.components['file-upload'] = {

  template: function() {
    // return $('template#file-upload').html();
    return jumplink.templates['file-upload'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = window.debug('rivets:file-upload');
    controller.debug('initialize', el, data);
    var $el = $(el);
    
    var db = firebase.firestore();
    var dbImages = db.collection('customerDomains').doc(jumplink.firebase.config.customerDomain).collection('images');
    
    var storage = firebase.storage();
    var storageEventsImagesRef =  storage.ref().child(jumplink.firebase.config.customerDomain + '/events/images');
    
    var fileReader  = new FileReader();
    
    var $form = $el.find('.file-upload-box');
    var $input = $form.find('input[type="file"]');
    var $label = $form.find('label');
    
    var $restart = $form.find('.box__restart');
    
    controller.droppedFiles = [];
    controller.previewFiles = [];
    controller.uploadedFiles = data.uploadedFiles;
    controller.isDragover = false;
    controller.isUploading = false;
    controller.hasFocus = false;
    
    var addUploadedFile = function(file) {
        if(!jumplink.utilities.isArray(controller.uploadedFiles)) {
            controller.uploadedFiles = [];
        }
        controller.uploadedFiles.push(file);
        data.uploadedFiles = controller.uploadedFiles; // make the files public
        $.event.trigger('rivets:file-upload:uploaded', [file]);
    };
    
    var addFilesToUpload = function(files) {
        files = Array.from(files);
        controller.debug('[addFilesToUpload]', files);
        controller.droppedFiles = files;
        previewFiles(files);
    };
    
    var getIndexByName = function(files, file) {
        var index = -1;
        files.forEach(function(currentFile, i) {
            controller.debug('[getIndexByName] currentFile', currentFile.name, file.name);
            if(currentFile.name === file.name) {
                index = i;
                return index;
            }
        });
        
        controller.debug('[getIndexByName]', file.name, index);
        return index;
    };
    
    var previewFiles = function(files) {
        files.forEach(function(file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var img = new Image();
                // load image to get width and height
                img.onload = function() {
                    previewFile = {
                        dataURL: reader.result,
                        name: file.name,
                        size: file.size,
                        width: img.width,
                        height: img.height,
                    };
                    controller.debug('[previewFiles] img.onload', previewFile);
                    controller.previewFiles.push(previewFile);
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
    };


    /**
     * Upload files to firebase storage and add it to firebase datastore
     */
    var uploadFiles = function (ref, files) {
        var uploadedFile;
        return Promise.all(files.map(function(file, fileIndex) {
           
            
            controller.debug('uploadedFile ref', ref);
            
            controller.debug('uploadedFile file', file);
            
            // store file to fiebase storage
            return ref.child(file.name)
            .put(file)
            .then(function(snapshot) {
                controller.debug('uploadedFile snapshot', snapshot);
                controller.debug('uploadedFile snapshot ref getDownloadURL', snapshot.ref.getDownloadURL());
                uploadedFile = {
                    downloadURL: null, // setted in next step
                    state: snapshot.state,
                    metadata: {
                        name: snapshot.metadata.name,
                        // downloadURLs: snapshot.metadata.downloadURLs,
                        md5Hash: snapshot.metadata.md5Hash,
                        size: snapshot.metadata.size,
                        updated: snapshot.metadata.size,
                        timeCreated: snapshot.metadata.timeCreated,
                        contentType: snapshot.metadata.contentType,
                        generation: snapshot.metadata.generation,
                    }
                };

                return snapshot.ref.getDownloadURL();
            })
            .then(function(downloadURL) {
                uploadedFile.downloadURL = downloadURL;
                // uploadedFile.downloadURLs = [downloadURL];
                controller.debug('uploadedFile', uploadedFile);
   
                // add image to db
                return dbImages.add(uploadedFile);
            })
            .then(function(docRef) {
                var currentPreviewFiles;
                var currentDroppedFiles;
                
                uploadedFile.id = docRef.id;
                addUploadedFile(uploadedFile);
                        
                
                // remove file from upload stack
                var droppedFileIndex = getIndexByName(controller.droppedFiles, file);
                if(droppedFileIndex !== -1) {
                    controller.debug('droppedFileIndex', droppedFileIndex);
                    currentDroppedFile = controller.droppedFiles.splice(droppedFileIndex, 1);
                }
                
                /**
                 * remove file from preview stack
                 * and get width and height from preview image to store in database
                 */
                var previewFileIndex = getIndexByName(controller.previewFiles, file);
                if(previewFileIndex !== -1) {
                     currentPreviewFiles = controller.previewFiles.splice(previewFileIndex, 1);
                     controller.debug('currentPreviewFiles', currentPreviewFiles);
                     uploadedFile.customMetadata = {
                        width: currentPreviewFiles[0].width,
                        height: currentPreviewFiles[0].height,
                     };
                }
                
                var message = 'Bild ' + uploadedFile.metadata.name + ' erfolgreich eingetragen';
                controller.debug(message, uploadedFile);

                return uploadedFile;
            });
        }))
        .then(function(files) {
            $.event.trigger('rivets:file-upload:complete', [files]);
            controller.isUploading = false;
        });
    };

    // letting the server side to know we are going to make an Ajax request
    $form.append('<input type="hidden" name="ajax" value="1" />');

    // automatically submit the form on file select
    $input.on('change', function(e) {
        addFilesToUpload(e.target.files);
        $form.trigger('submit');
    });

    // drag&drop files 
    $form
    .on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
        // preventing the unwanted behaviours
        e.preventDefault();
        e.stopPropagation();
    })
    .on('dragover dragenter', function() {
        // $form.addClass('is-dragover');
        controller.isDragover = true;
    })
    .on('dragleave dragend drop', function() {
        // $form.removeClass('is-dragover');
        controller.isDragover = false;
    })
    .on('drop', function(e) {
        var droppedFiles = e.originalEvent.dataTransfer.files; // the files that were dropped
        addFilesToUpload(droppedFiles);
        $form.trigger('submit'); // automatically submit the form on file drop
    });
    
    // if the form was submitted
    $form.on('submit', function(e) {
        // preventing the duplicate submissions if the current one is in progress
        if (controller.isUploading) {
            return false;
        }

        // $form.addClass('is-uploading').removeClass('is-error');
        controller.isUploading = true;
        e.preventDefault();

        // request
        controller.debug('request', controller.droppedFiles);
        
        uploadFiles(storageEventsImagesRef, controller.droppedFiles)
        .then(function(snapshots) {
          controller.debug('Uploaded a blob or file!', snapshots);
        })
        .catch(function(error) {  
            jumplink.utilities.showGlobalModal({
                title: 'Fehler',
                body: error.message,
            });
            controller.debug('error', error);
        });
    });


    // restart the form if has a state of error/success

    $restart
    .on('click', function(e) {
        e.preventDefault();
        // $form.removeClass('is-error is-success');
        $input.trigger('click');
    });

    // Firefox focus bug fix for file input
    $input
    .on('focus', function() {
        // $input.addClass('has-focus');
        controller.hasFocus = true;
    })
    .on('blur', function() {
        $input.removeClass('has-focus');
        controller.hasFocus = false;
    });

    return controller;
  }
};