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
export class NoteComponent implements OnInit {
  noteId: string;
  noteIndex: number; // When we select a note, we capture its index in the array as well as its id
  notes: Note[]; // The list of all the user's notes, get it on init

  constructor(private noteService: NoteService) {}

  ngOnInit() {
    // // Populate notes array to display in sidebar, subscribe to changes
    this.noteService.getNotes().subscribe(res => {
      console.log('GET message:', res.message);
      console.log(res.notes);
      this.notes = res.notes;
    });
  }

  private updateNote(form: NgForm, resetFormAfterUpdate = false) {
    console.log('Updating note...', this.noteId);
    this.noteService
      .updateNote(form.value.title, form.value.content, this.noteId)
      .subscribe(res => {
        console.log('PUT message:', res.message);
        console.log('Updated note:', res.updatedNote);
        this.notes[this.noteIndex] = res.updatedNote;
        console.log(this.notes);
        if (resetFormAfterUpdate) {
          this.resetFormAndNoteInfo(form);
        }
      });
  }

  private createNote(title: string, content: string) {
    console.log('Creating note...', this.noteId);
    this.noteService.createNote(title, content).subscribe(res => {
      console.log('POST message:', res.message);
      this.notes.push(res.note);
      this.noteId = res.note.noteId; // set noteId
      this.noteIndex = this.notes.length - 1; // set index
    });
  }

  onSave(form: NgForm) {
    console.log('Saving... NoteId:', this.noteId);
    console.log('NoteIndex:', this.noteIndex);
    if (this.noteId) {
      this.updateNote(form);
    } else {
      this.createNote(form.value.title, form.value.content);
    }
    // Reset the state of the form while initializing it to the submitted values
    form.resetForm({ title: form.value.title, content: form.value.content });
  }

  onNew(form: NgForm) {
    if (form.dirty && form.valid) {
      // save the form before resetting state for new note
      if (confirm('Save current note?')) this.updateNote(form, true);
      else this.resetFormAndNoteInfo(form);
    } else this.resetFormAndNoteInfo(form);
  }

  resetFormAndNoteInfo(form: NgForm) {
    this.noteId = null; // reset noteId
    this.noteIndex = null; // reset index
    form.resetForm();
  }

  onDelete(form: NgForm) {
    if ((!form.value.title && !form.value.content) || !this.noteId) {
      this.resetFormAndNoteInfo(form);
    } else {
      console.log('Deleting note...');
      if (confirm('Are you sure you want to delete?'))
        this.deleteNoteAndResetForm(form);
    }
  }

  deleteNoteAndResetForm(form: NgForm) {
    if (this.noteId && this.noteIndex >= 0) {
      this.noteService.deleteNote(this.noteId).subscribe(res => {
        console.log('DELETE message:', res.message);
        console.log('Delete count:', res.deletedCount);
        if (res.deletedCount) {
          this.notes.splice(this.noteIndex, 1);
        }
        this.resetFormAndNoteInfo(form);
      });
    }
  }

  setActive(note: Note, noteIndex: number, form: NgForm) {
    console.log('Selected note', note);
    form.setValue({ title: note.title, content: note.content });
    this.noteId = note.noteId;
    this.noteIndex = noteIndex;
    console.log('Note index:', noteIndex);
  }
}
