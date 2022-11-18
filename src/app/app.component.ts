import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { onAuthUIStateChange, AuthState } from '@aws-amplify/ui-components';
import { Auth } from 'aws-amplify';
//import * as Observable from 'zen-observable';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from "moment";

import { DataStore,Hub } from 'aws-amplify';
import { Chatty } from '../models';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public user!:any;
  public subscription:any;
  moment = moment;
  public messages: Array<Chatty> = [];
  loading = true;
  public createForm!: FormGroup;
  public unregister:any;

  constructor(private ref: ChangeDetectorRef, private fb: FormBuilder) {
    Auth.currentAuthenticatedUser().then(user => {
      this.user = user
      console.log(this.user)
    })
  }

  loadMessages() {
    DataStore.query<Chatty>(Chatty)
    .then(messages => {
      this.loading = false;
      this.messages =messages.reverse();
    })
  }

  ngOnInit() {
    this.unregister = onAuthUIStateChange((state, user) => {
      if (state === AuthState.SignedIn) {
        this.user = user;
        console.log(this.user);

        this.ref.detectChanges();
      }
    })

    this.createForm = this.fb.group({
      'message': ['', Validators.required],
    });

    this.loading = true;
    this.loadMessages();

    //Subscribe to changes
    this.subscription = DataStore.observe<Chatty>(Chatty).subscribe(msg => {
     // console.log(msg.model, msg.opType, msg.element);
      this.loadMessages();
    });

    const listener = Hub.listen("datastore", async hubData => {
      const  { event, data } = hubData.payload;
      console.log(hubData)
    //  console.log(data);
      if(data?.isEmpty==true){
        console.log("Data is synced to DynamicDB");
      }

     // console.log(hubData.payload.data)
    //  console.log(event)
      if (event === "syncQueriesStarted") {
          console.log("Sync Started to DataStore")
        }else if(event==="modelSynced"){
         console.log("Sync Done for DataStore")
        }

}
    )

}

  ngOnDestroy() {
    this.unregister();
    if (!this.subscription) return;
    this.subscription.unsubscribe();
  }

  public onCreate(message: any) {
    if ( message.message=="" ) return;
    DataStore.save(
      new Chatty({
        user: this.user.username,
        message: message.message,
      })
    ).then(() => {
      console.log('item created!');
      this.createForm.reset();
      this.loadMessages();
    })
    .catch(e => {
      console.log('error creating message...', e);
    });
  }

  // public async onDeleteAll() {
  //   await DataStore.delete<Chatty>(Chatty)
  //   .then(() => this.loadMessages())
  //   .catch(e => {
  //     console.log('error deleting all messages...', e);
  //   });
  // }
}
