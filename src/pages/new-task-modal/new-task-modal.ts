import { Component } from '@angular/core';
import { ViewController, normalizeURL, ToastController, LoadingController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { ImagePicker } from '@ionic-native/image-picker';

@Component({
  selector: 'page-new-task-modal',
  templateUrl: 'new-task-modal.html'
})
export class NewTaskModalPage {

  validations_form: FormGroup;
  image: any;
  loading: any;
  toast: any;

  constructor(
    private viewCtrl: ViewController,
    private toastCtrl: ToastController,
    private formBuilder: FormBuilder,
    private imagePicker: ImagePicker,
    private firebaseService: FirebaseService,
    private loadingCtrl: LoadingController) 
  {
    this.loading = this.loadingCtrl.create();
    this.toast = this.toastCtrl;
  }

  displayToast(message) {
    let toast = this.toast.create({
      message: message,
      duration: 3000
    })
    toast.present();
  }

  ionViewWillLoad(){
    this.resetFields()
  }

  resetFields(){
    this.image = "./assets/imgs/default_image.jpg";
    this.validations_form = this.formBuilder.group({
      title: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required)
    });
  }

  dismiss() {
   this.viewCtrl.dismiss();
  }

  onSubmit(value){
    let data = {
      title: value.title,
      description: value.description,
      image: this.image
    }
    this.firebaseService.createTask(data)
    .then(
      res => {
        console.log('Resetting fields');
        this.resetFields();
        console.log('Dismissing the viewCtrl');
        this.viewCtrl.dismiss();
        this.displayToast(`Note with ${data.title} is created!`);
      }
    )
  }

  openImagePicker(){
    console.log('Inside image picker');
    this.imagePicker.hasReadPermission()
    .then((result) => {
      if(result == false){
        // no callbacks required as this opens a popup which returns async
        this.imagePicker.requestReadPermission();
      }
      else if(result == true){
        this.imagePicker.getPictures({
          maximumImagesCount: 1
        }).then(
          (results) => {
            for (var i = 0; i < results.length; i++) {
              this.uploadImageToFirebase(results[i]);
            }
          }, (err) => console.log(err)
        );
      }
    }, (err) => {
      console.log(err);
    });
  }

  uploadImageToFirebase(image){
    this.loading.present();
    image = normalizeURL(image);
    let randomId = Math.random().toString(36).substr(2, 5);
    console.log(`Uploading image ${image} to firebase with ${randomId}`);
    //uploads img to firebase storage
    this.firebaseService.uploadImage(image, randomId)
    .then(photoURL => {
      this.image = photoURL;
      this.loading.dismiss();
      let toast = this.toastCtrl.create({
        message: 'Image was updated successfully',
        duration: 3000
      });
      toast.present();
      })
  }

}
