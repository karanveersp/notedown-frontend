import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NoteService } from './note.service';
import { Note } from './note.model';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent implements OnInit, OnDestroy {
  noteId = '';
  notesSubscription: Subscription;
  notes: Note[]; // The list of all the user's notes, get it on init. When user
  // clicks on a note link in the sidebar, that note's data is populated into the fields
  // and that note's id is captured internally. If we save the note, then we execute the put
  // request with the note's id.

  constructor(private noteService: NoteService) {}

  ngOnInit() {
    // Populate notes array to display in sidebar, subscribe to changes
    this.notes = this.noteService.getNotes();
    console.log('Length on init', this.notes.length);
    this.notesSubscription = this.noteService
      .getNotesObservable()
      .subscribe(notes => {
        this.notes = notes;
        console.log('Length on update', this.notes.length);
      });
  }

  ngOnDestroy() {
    this.notesSubscription.unsubscribe();
  }

  onSave(form: NgForm) {
    if (this.noteId.length !== 0) {
      console.log('Updating note...', this.noteId);
      this.noteService.updateNote(
        form.value.title,
        form.value.content,
        this.noteId
      );
    } else {
      console.log('Creating note...', this.noteId);
      this.noteId = this.noteService.createNote(
        form.value.title,
        form.value.content
      );
    }
    form.resetForm({'title': form.value.title, 'content': form.value.content});
  }

  onNew(form: NgForm) {
    this.noteId = '';
    form.resetForm();
  }

  onDelete(form: NgForm) {
    console.log('Deleting note...');
    if (this.noteId.length === 0) return;
    this.noteService.deleteNote(this.noteId);
    this.onNew(form);
  }

  setActive(note: Note, form: NgForm) {
    console.log('Selected note', note);
    form.setValue({ title: note.title, content: note.content });
    this.noteId = note.noteId;
  }
}
