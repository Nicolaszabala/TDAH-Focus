import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { addNote, editNote, deleteNote } from '../../store/slices/tasksSlice';
import NoteItem from './NoteItem';

/**
 * NotesModal Component
 * Modal for viewing and managing task notes
 */
export default function NotesModal({ visible, task, onClose }) {
  const dispatch = useDispatch();
  const [newNoteContent, setNewNoteContent] = useState('');

  if (!task) return null;

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      dispatch(
        addNote({
          taskId: task.id,
          content: newNoteContent.trim(),
        })
      );
      setNewNoteContent('');
    }
  };

  const handleEditNote = (noteId, content) => {
    dispatch(
      editNote({
        taskId: task.id,
        noteId,
        content,
      })
    );
  };

  const handleDeleteNote = (noteId) => {
    dispatch(
      deleteNote({
        taskId: task.id,
        noteId,
      })
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="document-text" size={24} color="#3498DB" />
            <Text style={styles.headerTitle} numberOfLines={1}>
              Notas
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={28} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        {/* Task title */}
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle} numberOfLines={2}>
            {task.title}
          </Text>
        </View>

        {/* Notes list */}
        <ScrollView
          style={styles.notesList}
          contentContainerStyle={styles.notesListContent}
        >
          {task.notes && task.notes.length > 0 ? (
            task.notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onEdit={(content) => handleEditNote(note.id, content)}
                onDelete={() => handleDeleteNote(note.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#BDC3C7" />
              <Text style={styles.emptyStateText}>
                No hay notas aún
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Agrega una nota para recordar detalles importantes
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Add note section */}
        <View style={styles.addNoteSection}>
          <TextInput
            style={styles.input}
            value={newNoteContent}
            onChangeText={setNewNoteContent}
            placeholder="Escribe una nueva nota..."
            placeholderTextColor="#95A5A6"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              !newNoteContent.trim() && styles.addButtonDisabled,
            ]}
            onPress={handleAddNote}
            disabled={!newNoteContent.trim()}
          >
            <Ionicons
              name="add-circle"
              size={24}
              color={newNoteContent.trim() ? '#27AE60' : '#BDC3C7'}
            />
            <Text
              style={[
                styles.addButtonText,
                !newNoteContent.trim() && styles.addButtonTextDisabled,
              ]}
            >
              Agregar Nota
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 10,
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    lineHeight: 22,
  },
  notesList: {
    flex: 1,
  },
  notesListContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#95A5A6',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  addNoteSection: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#2C3E50',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
  },
  addButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27AE60',
    marginLeft: 8,
  },
  addButtonTextDisabled: {
    color: '#BDC3C7',
  },
});
