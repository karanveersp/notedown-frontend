import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Note } from './note.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  notes: Note[] = [
    {
      title: 'a;ldfj;akdf',
      content: 'a;sdlfjadslb',
      noteId: '0',
      author: this.authService.getUserId()
    }
  ];
  index = 1;

  noteListPublisher = new Subject<Note[]>();

  constructor(private authService: AuthService) {}

  getNotes() {
    return this.notes.slice();
  }

  getNotesObservable() {
    return this.noteListPublisher.asObservable();
  }

  notifyListeners() {
    this.noteListPublisher.next(this.notes.slice());
  }

  updateNote(title: string, content: string, noteId: string) {
    const existing = this.notes.find(n => n.noteId === noteId);
    const index = this.notes.findIndex(n => n === existing);
    const updated: Note = {
      ...existing,
      title: title,
      content: content
    };
    this.notes[index] = updated;
    this.notifyListeners();
  }

  createNote(title: string, content: string) {
    console.log('Creating note');
    const note: Note = {
      title: title,
      content: content,
      author: this.authService.getUserId(),
      noteId: this.index.toString()
    };
    ++this.index;
    this.notes.push(note);
    this.notifyListeners();
    return note.noteId;
  }

  deleteNote(noteId: string) {
    console.log(this.notes);
    if (this.notes.length === 1 && this.notes[0].noteId === noteId) {
      this.notes = [];
    } else {
      this.notes = this.notes.filter(note => note.noteId !== noteId);
    }
    console.log(this.notes, 'after');
    this.notifyListeners();
  }
}
