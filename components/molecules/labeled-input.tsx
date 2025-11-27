/**
 * LabeledInput Molecule
 * 
 * Phase 3 — Section 2: FORM MOLECULES
 * Wrapper for Input with integrated label
 */

'use client';

import React from 'react';
import { FormField, FormFieldProps } from './form-field';

export interface LabeledInputProps extends FormFieldProps {
  // Alias for FormField - same component with different name
}

const LabeledInput = React.forwardRef<HTMLInputElement, LabeledInputProps>(
  (props, ref) => {
    return <FormField ref={ref} {...props} />;
  }
);

LabeledInput.displayName = 'LabeledInput';

export { LabeledInput };

