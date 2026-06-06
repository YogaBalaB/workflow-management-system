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
 * Admin is a superset of Manager — they can perform any Manager action.
 * @param {string} currentStatus - The current status of the request.
 * @param {string} nextStatus - The status the user wants to transition to.
 * @param {string} userRole - The role of the user requesting the change.
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateTransition = (currentStatus, nextStatus, userRole) => {
  if (!currentStatus || !nextStatus || !userRole) {
    return { isValid: false, message: 'Current status, new status, and user role are all required.' };
  }

  if (currentStatus === nextStatus) {
    return { isValid: true, message: 'Status unchanged.' };
  }

  const allowedNextStates = WORKFLOW_TRANSITIONS[currentStatus];
  if (!allowedNextStates) {
    return { isValid: false, message: `No transitions are allowed from the '${currentStatus}' state.` };
  }

  const requiredRole = allowedNextStates[nextStatus];
  if (!requiredRole) {
    return {
      isValid: false,
      message: `Transition from '${currentStatus}' to '${nextStatus}' is invalid.`
    };
  }

  // Admin can perform any action a Manager can, in addition to their own Admin actions.
  const effectiveRole = (userRole === ROLES.ADMIN && requiredRole === ROLES.MANAGER)
    ? ROLES.MANAGER
    : userRole;

  if (effectiveRole !== requiredRole) {
    return {
      isValid: false,
      message: `Unauthorized. Only a '${requiredRole}' can change status from '${currentStatus}' to '${nextStatus}' (your role: '${userRole}').`
    };
  }

  return { isValid: true, message: 'Transition is valid.' };
};