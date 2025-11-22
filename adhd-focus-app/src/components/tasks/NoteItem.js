import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * NoteItem Component
 * Displays individual note with inline editing capability
 */
export default function NoteItem({ note, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays}d`;
    }
  };

  const handleSave = () => {
    if (editedContent.trim()) {
      onEdit(editedContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(note.content);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      {/* Note content or edit input */}
      <View style={styles.contentContainer}>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editedContent}
            onChangeText={setEditedContent}
            multiline
            autoFocus
            placeholder="Escribe tu nota..."
            placeholderTextColor="#95A5A6"
          />
        ) : (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            activeOpacity={0.7}
            style={styles.noteTextContainer}
          >
            <Text style={styles.noteText}>{note.content}</Text>
          </TouchableOpacity>
        )}

        {/* Metadata */}
        <View style={styles.metadata}>
          <Ionicons name="time-outline" size={12} color="#95A5A6" />
          <Text style={styles.timestamp}>
            {note.updatedAt
              ? `Editado ${formatDate(note.updatedAt)}`
              : formatDate(note.createdAt)}
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        {isEditing ? (
          <>
            {/* Save button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="checkmark" size={18} color="#27AE60" />
            </TouchableOpacity>

            {/* Cancel button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color="#95A5A6" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Edit button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => setIsEditing(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="pencil" size={16} color="#3498DB" />
            </TouchableOpacity>

            {/* Delete button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash" size={16} color="#E74C3C" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3498DB',
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  noteTextContainer: {
    marginBottom: 6,
  },
  noteText: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 22,
  },
  input: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 22,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3498DB',
    marginBottom: 6,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 11,
    color: '#95A5A6',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  editButton: {
    backgroundColor: '#E8F4FD',
  },
  deleteButton: {
    backgroundColor: '#FDEAEA',
  },
  saveButton: {
    backgroundColor: '#E8F5E9',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
});
