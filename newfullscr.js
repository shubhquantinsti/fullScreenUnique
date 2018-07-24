var fs = require('fs');
var jsonexport = require('jsonexport');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/first');

mongoose.connection.once('open',function(){
  console.log('Connection has been made...');
}).on('error',function(error){
    console.log('Connection error',error);
});

var workSchema = new Schema({
                config : {
                  isFullscreen : Boolean,
                  playbackRate : Number,
                  isMuted : Boolean,
                  isPlaying : Boolean,
                  subtitle : String
                },
                userId : String,
                sectionId : String,
                unitId : String,
                courseId : String,
                eventType : String,
                currentTime : Number,
                totalDurartion : Number,
                percentage : Number,
                flag : Number,
                createdAt : Date,
                updatedAt : Date
            });

var collectionW = mongoose.model('quantravid',workSchema, 'quantravid');

var json1;
var json2;

collectionW.aggregate(
                      [
                          {$match : { 'config.isPlaying' : true, 'config.isFullscreen' : true }},
                          {$group : { _id : {'courseId':'$courseId','sectionId':'$sectionId','unitId':'$unitId','user' : '$userId','fullScr' : '$config.isFullscreen'}}},
                          //{$project : {'fullScreen': '$fullScr'}},
                          {$sort : {_id : 1}}
                      ],function(err,data){
                          json1 = data;
                          //console.log(typeof(json1[0]._id.courseId + json1[0]._id.sectionId + json1[0]._id.unitId));

                          collectionW.aggregate(
                            [
                                {$match : { 'config.isPlaying' : true, 'config.isFullscreen' : false }},
                                {$group : { _id : {'courseId':'$courseId','sectionId':'$sectionId','unitId':'$unitId','user' : '$userId','fullScr' : '$config.isFullscreen'}}},
                                //{$project : {'fullScreen': '$fullScr'}},
                                {$sort : {_id : 1}}
                            ],function(err,data){
                                json2 = data;

                                var res = [];

                                for(var i = 0;i < json1.length;i++){
                                  var v = json1[i]._id.courseId + json1[i]._id.sectionId + json1[i]._id.unitId;
                                  for(var j = 0;j < json2.length;j++){

                                    while(1){
                                      if(i>=json1.length) break;
                                      if(v == json1[i]._id.courseId + json1[i]._id.sectionId + json1[i]._id.unitId){
                                        res.push({_id: json1[i]._id});
                                        i++;
                                      }
                                      else {
                                        break;
                                      }
                                    }

                                    while(1){
                                      if(j>=json2.length) break;
                                      if(v == json2[j]._id.courseId + json2[j]._id.sectionId + json2[j]._id.unitId){
                                        res.push({_id: json2[j]._id});
                                        j++;
                                      }
                                      else {
                                        break;
                                      }
                                    }

                                  }
                                }

                                //console.log(res);
                                var ff = JSON.stringify(res);
                                //console.log(ff);
                                fs.writeFile('jsonFile.json',ff,function(){console.log('Wrote');
                                 var reader = fs.createReadStream('jsonFile.json');
                                 var writer = fs.createWriteStream('dataQuantraQuiz.csv');

                                reader.pipe(jsonexport()).pipe(writer);

                              });

                            });

                      });
