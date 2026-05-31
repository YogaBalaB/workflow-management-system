// Workflow transitions configuration as defined in the PRD

export const ROLES = {
  USER: 'User',
  MANAGER: 'Manager',
  ADMIN: 'Admin'
};

export const STATES = {
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  NEEDS_CLARIFICATION: 'Needs Clarification',
  CLOSED: 'Closed',
  REOPENED: 'Reopened'
};

// Allowed transitions: current_state -> { next_state: allowed_role }
export const WORKFLOW_TRANSITIONS = {
  [STATES.SUBMITTED]: {
    [STATES.APPROVED]: ROLES.MANAGER,
    [STATES.REJECTED]: ROLES.MANAGER,
    [STATES.NEEDS_CLARIFICATION]: ROLES.MANAGER
  },
  [STATES.NEEDS_CLARIFICATION]: {
    [STATES.SUBMITTED]: ROLES.USER
  },
  [STATES.APPROVED]: {
    [STATES.CLOSED]: ROLES.ADMIN
  },
  [STATES.CLOSED]: {
    [STATES.REOPENED]: ROLES.ADMIN
  },
  // Reopened request acts exactly like Submitted and goes through the Manager again
  [STATES.REOPENED]: {
    [STATES.APPROVED]: ROLES.MANAGER,
    [STATES.REJECTED]: ROLES.MANAGER,
    [STATES.NEEDS_CLARIFICATION]: ROLES.MANAGER
  }
};

/**
 * Validates whether a state transition is allowed for a given role.
 * @param {string} currentStatus - The current status of the request.
 * @param {string} nextStatus - The status the user wants to transition to.
 * @param {string} userRole - The role of the user requesting the change.
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateTransition = (currentStatus, nextStatus, userRole) => {
  // Normalize parameters
  if (!currentStatus || !nextStatus || !userRole) {
    return { isValid: false, message: 'Current status, new status, and user role are all required.' };
  }

  // 1. If status is unchanged, that is always valid but doesn't require a transition
  if (currentStatus === nextStatus) {
    return { isValid: true, message: 'Status unchanged.' };
  }

  // 2. Check if the current state has any transitions defined
  const allowedNextStates = WORKFLOW_TRANSITIONS[currentStatus];
  if (!allowedNextStates) {
    return { isValid: false, message: `No transitions are allowed from the '${currentStatus}' state.` };
  }

  // 3. Check if the next status is in the allowed next states
  const requiredRole = allowedNextStates[nextStatus];
  if (!requiredRole) {
    return { 
      isValid: false, 
      message: `Transition from '${currentStatus}' to '${nextStatus}' is invalid.` 
    };
  }

  // 4. Verify user has the required role
  // Note: Admins can do everything Managers can do, but we strictly enforce the roles specified in the PRD.
  // For standard strict enforcement:
  if (userRole !== requiredRole) {
    return { 
      isValid: false, 
      message: `Unauthorized. Only a '${requiredRole}' can change status from '${currentStatus}' to '${nextStatus}' (your role: '${userRole}').` 
    };
  }

  return { isValid: true, message: 'Transition is valid.' };
};
