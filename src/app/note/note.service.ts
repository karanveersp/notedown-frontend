import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Note } from './note.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor(private authService: AuthService, private http: HttpClient) {}

  /**
   * GET all notes
   */
  getNotes(): Observable<{ message: string; notes: Note[] }> {
    return this.http
      .get<{ message: string; notes: any[] }>('http://localhost:3000/api/notes')
      .pipe(
        map(res => {
          console.log('Notes in getNotes:', res.notes);
          const notesWithNoteId: Note[] = [];
          res.notes.forEach(note =>
            // Transform _id property into noteId property as in note.model.ts
            notesWithNoteId.push({
              title: note.title,
              content: note.content,
              author: note.author,
              noteId: note._id
            })
          );
          return { message: res.message, notes: notesWithNoteId };
        })
      );
  }

  updateNote(
    title: string,
    content: string,
    noteId: string
  ): Observable<{ message: string; updatedNote: Note }> {

    const body = {
      title: title,
      content: content,
      author: this.authService.getUserId()
    };
    return this.http
      .put<{ message: string }>(
        'http://localhost:3000/api/notes/' + noteId,
        body
      )
      .pipe(
        map(res => {
          const updatedNote: Note = {
            title: title,
            content: content,
            author: body.author,
            noteId: noteId
          };
          return { message: res.message, updatedNote: updatedNote };
        })
      );
  }

  createNote(
    title: string,
    content: string
  ): Observable<{ message: string; note: Note }> {
    const body = {
      title: title,
      content: content,
      author: this.authService.getUserId()
    };

    return this.http
      .post<{ message: string; noteId: string }>(
        'http://localhost:3000/api/notes',
        body
      )
      .pipe(
        map(res => {
          // Attach author to response
          const note: Note = {
            // build a note from the response
            title: title,
            content: content,
            author: body.author,
            noteId: res.noteId
          };
          return { message: res.message, note: note };
        })
      );
  }

  deleteNote(
    noteId: string
  ): Observable<{ message: string; deletedCount: number }> {
    return this.http.delete<{ message: string; deletedCount: number }>(
      'http://localhost:3000/api/notes/' + noteId
    );
  }
}
