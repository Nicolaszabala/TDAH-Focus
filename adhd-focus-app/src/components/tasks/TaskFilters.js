import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setFilter, selectTaskCounts } from '../../store/slices/tasksSlice';
import { TASK_FILTERS } from '../../utils/constants';

/**
 * TaskFilters Component
 * RF04: Filter tasks by type (all, obligatory, optional)
 * RF10: Show task count by type
 */
export default function TaskFilters() {
  const dispatch = useDispatch();
  const filter = useSelector((state) => state.tasks.filter);
  const taskCounts = useSelector(selectTaskCounts);

  const filters = [
    {
      key: TASK_FILTERS.ALL,
      label: 'Todas',
      count: taskCounts.pending,
    },
    {
      key: TASK_FILTERS.OBLIGATORY,
      label: 'Obligatorias',
      count: taskCounts.obligatory,
    },
    {
      key: TASK_FILTERS.OPTIONAL,
      label: 'Opcionales',
      count: taskCounts.optional,
    },
  ];

  const handleFilterPress = (filterKey) => {
    dispatch(setFilter(filterKey));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filterItem) => {
          const isActive = filter === filterItem.key;

          return (
            <TouchableOpacity
              key={filterItem.key}
              style={[
                styles.filterButton,
                isActive && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterPress(filterItem.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterLabel,
                  isActive && styles.filterLabelActive,
                ]}
              >
                {filterItem.label}
              </Text>
              {/* RF10: Task count badge */}
              <View
                style={[
                  styles.countBadge,
                  isActive && styles.countBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    isActive && styles.countTextActive,
                  ]}
                >
                  {filterItem.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    minHeight: 44, // RNF07: Minimum 44x44pt touch target
  },
  filterButtonActive: {
    backgroundColor: '#E74C3C',
    borderColor: '#E74C3C',
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginRight: 8,
  },
  filterLabelActive: {
    color: '#fff',
  },
  countBadge: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  countText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  countTextActive: {
    color: '#fff',
  },
});
