/**
 * Tutorial Component - Interactive Guided Tour
 * Coach marks style onboarding that highlights specific UI components
 *
 * Features:
 * - Step 1 & 7: Centered modals (welcome & completion)
 * - Steps 2-6: Positioned tooltips pointing to actual UI elements
 * - Visual spotlight effect on highlighted components
 * - Auto-navigation to relevant tabs
 * - Navigation: Next, Previous, Skip
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setTutorialCompleted } from '../../store/slices/settingsSlice';
import { saveTutorialCompleted } from '../../services/storageService';
import { TUTORIAL_STEPS } from '../../utils/constants';

const { width, height } = Dimensions.get('window');

export default function Tutorial({ visible, onComplete, navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const dispatch = useDispatch();

  const step = TUTORIAL_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const totalSteps = TUTORIAL_STEPS.length;
  const isCentered = step.position === 'center';

  // No auto-navigation - all steps are centered modals

  /**
   * Go to next step
   */
  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Go to previous step
   */
  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Skip tutorial entirely
   */
  const handleSkip = async () => {
    await completeTutorial();
  };

  /**
   * Complete tutorial
   */
  const handleComplete = async () => {
    await completeTutorial();
  };

  /**
   * Mark tutorial as completed and persist
   */
  const completeTutorial = async () => {
    console.log('[Tutorial] Completing tutorial...');
    dispatch(setTutorialCompleted(true));
    await saveTutorialCompleted(true);
    console.log('[Tutorial] Tutorial completion saved to storage');
    if (onComplete) {
      onComplete();
    }
  };

  if (!visible) return null;

  // Get tooltip position based on step
  const getTooltipPosition = () => {
    switch (step.id) {
      case 2: // Tareas - bottom center
        return { bottom: 120, left: 20, right: 20 };
      case 3: // Pomodoro - bottom center
        return { bottom: 120, left: 20, right: 20 };
      case 4: // Modo Concentración - center
        return { top: height * 0.3, left: 20, right: 20 };
      case 5: // Sonidos - bottom center
        return { bottom: 120, left: 20, right: 20 };
      case 6: // Asistente - bottom center
        return { bottom: 120, left: 20, right: 20 };
      default:
        return {};
    }
  };

  // Get spotlight position (where to highlight)
  const getSpotlightPosition = () => {
    const tabBarHeight = 70;
    const headerHeight = 60;

    switch (step.id) {
      case 2: // Tareas tab
        return { bottom: tabBarHeight, left: width * 0.2, width: width * 0.2, height: tabBarHeight };
      case 3: // Pomodoro tab
        return { bottom: tabBarHeight, left: width * 0.4, width: width * 0.2, height: tabBarHeight };
      case 4: // Focus button in home
        return { top: height * 0.5, left: 20, right: 20, height: 60 };
      case 5: // Sonidos tab
        return { bottom: tabBarHeight, left: width * 0.6, width: width * 0.2, height: tabBarHeight };
      case 6: // Asistente tab
        return { bottom: tabBarHeight, left: width * 0.8 - 40, width: width * 0.2, height: tabBarHeight };
      default:
        return null;
    }
  };

  const tooltipPosition = getTooltipPosition();
  const spotlightPosition = getSpotlightPosition();

  // Render centered modal (steps 1 & 7)
  if (isCentered) {
    return (
      <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={handleSkip}>
        <View style={styles.overlay}>
          <View style={styles.centeredCard}>
            <View style={styles.iconContainer}>
              <Ionicons name={step.icon} size={48} color="#E74C3C" />
            </View>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>

            <View style={styles.progressContainer}>
              {TUTORIAL_STEPS.map((_, index) => (
                <View
                  key={index}
                  style={[styles.progressDot, index === currentStep && styles.progressDotActive]}
                />
              ))}
            </View>

            <Text style={styles.stepCounter}>{currentStep + 1} de {totalSteps}</Text>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton, isFirstStep && styles.buttonDisabled]}
                onPress={handlePrevious}
                disabled={isFirstStep}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color={isFirstStep ? '#BDC3C7' : '#7F8C8D'} />
                <Text style={[styles.buttonText, styles.secondaryButtonText, isFirstStep && styles.buttonTextDisabled]}>
                  Anterior
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleNext} activeOpacity={0.7}>
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                  {isLastStep ? '¡Comenzar!' : 'Siguiente'}
                </Text>
                <Ionicons name={isLastStep ? 'checkmark-circle' : 'arrow-forward'} size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.skipButtonText}>Saltar tutorial</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Render positioned tooltip (steps 2-6)
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={handleSkip}>
      <View style={styles.tourOverlay} pointerEvents="box-none">
        {/* Dark overlay with spotlight cutout effect */}
        <View style={styles.overlayTop} pointerEvents="none" />

        {/* Spotlight highlight */}
        {spotlightPosition && (
          <View style={[styles.spotlight, spotlightPosition]} pointerEvents="none">
            <View style={styles.spotlightInner} />
          </View>
        )}

        {/* Tooltip card */}
        <View style={[styles.tooltipCard, tooltipPosition]}>
          {/* Arrow pointing to element */}
          {step.id !== 4 && (
            <View style={styles.arrowDown} pointerEvents="none">
              <Ionicons name="caret-down" size={32} color="#fff" />
            </View>
          )}

          <View style={styles.tooltipContent}>
            <View style={styles.tooltipHeader}>
              <Ionicons name={step.icon} size={32} color="#E74C3C" />
              <Text style={styles.tooltipTitle}>{step.title}</Text>
            </View>

            <Text style={styles.tooltipDescription}>{step.description}</Text>

            {/* Progress */}
            <View style={styles.tooltipProgress}>
              <Text style={styles.tooltipStepCounter}>{currentStep + 1} de {totalSteps}</Text>
              <View style={styles.progressContainer}>
                {TUTORIAL_STEPS.map((_, index) => (
                  <View
                    key={index}
                    style={[styles.progressDotSmall, index === currentStep && styles.progressDotActiveSmall]}
                  />
                ))}
              </View>
            </View>

            {/* Navigation */}
            <View style={styles.tooltipButtons}>
              <TouchableOpacity
                style={[styles.tooltipButton, styles.secondaryButton, isFirstStep && styles.buttonDisabled]}
                onPress={handlePrevious}
                disabled={isFirstStep}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={18} color={isFirstStep ? '#BDC3C7' : '#7F8C8D'} />
                <Text style={[styles.tooltipButtonText, styles.secondaryButtonText, isFirstStep && styles.buttonTextDisabled]}>
                  Anterior
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tooltipButton, styles.primaryButton]}
                onPress={handleNext}
                activeOpacity={0.7}
              >
                <Text style={[styles.tooltipButtonText, styles.primaryButtonText]}>
                  {isLastStep ? '¡Comenzar!' : 'Siguiente'}
                </Text>
                <Ionicons name={isLastStep ? 'checkmark-circle' : 'arrow-forward'} size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.tooltipSkip} onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.tooltipSkipText}>Saltar tutorial</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Centered modal styles (steps 1 & 7)
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centeredCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },

  // Tour overlay styles (steps 2-6)
  tourOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  overlayTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  spotlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#E74C3C',
  },
  spotlightInner: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 10,
  },

  // Tooltip styles
  tooltipCard: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  arrowDown: {
    position: 'absolute',
    bottom: -20,
    left: '50%',
    marginLeft: -16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tooltipContent: {
    width: '100%',
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  tooltipTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  tooltipDescription: {
    fontSize: 15,
    color: '#7F8C8D',
    lineHeight: 22,
    marginBottom: 16,
  },
  tooltipProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tooltipStepCounter: {
    fontSize: 13,
    color: '#95A5A6',
    fontWeight: '600',
  },
  tooltipButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  tooltipButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    minHeight: 44,
    gap: 6,
  },
  tooltipButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tooltipSkip: {
    alignSelf: 'center',
    paddingVertical: 6,
  },
  tooltipSkipText: {
    fontSize: 13,
    color: '#95A5A6',
    textDecoration: 'underline',
  },

  // Common styles
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ECF0F1',
  },
  progressDotActive: {
    backgroundColor: '#E74C3C',
    width: 24,
  },
  progressDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ECF0F1',
  },
  progressDotActiveSmall: {
    backgroundColor: '#E74C3C',
    width: 18,
  },
  stepCounter: {
    fontSize: 14,
    color: '#95A5A6',
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minHeight: 48,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#E74C3C',
  },
  secondaryButton: {
    backgroundColor: '#ECF0F1',
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#7F8C8D',
  },
  buttonTextDisabled: {
    color: '#BDC3C7',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#95A5A6',
    textDecoration: 'underline',
  },
});
