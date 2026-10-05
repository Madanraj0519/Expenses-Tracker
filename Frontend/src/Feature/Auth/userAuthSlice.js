import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: null,
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'authUser',
    initialState,
    reducers: {
        signInStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        signInSuccess: (state, action) => {
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
        },
        signInFailure: (state, action) => {
            state.loading = false;
            // Always ensure error stored is a string to prevent non-serializable Redux warnings
            const payload = action.payload;
            if (typeof payload === 'string') {
                state.error = payload;
            } else if (payload && typeof payload.message === 'string') {
                state.error = payload.message;
            } else if (payload && typeof payload.friendlyMessage === 'string') {
                state.error = payload.friendlyMessage;
            } else {
                state.error = 'An error occurred during authentication.';
            }
        },
        updateCurrentUser: (state, action) => {
            if (state.currentUser) {
                // If currentUser has nested user object
                if (state.currentUser.user) {
                    state.currentUser.user = {
                        ...state.currentUser.user,
                        ...action.payload
                    };
                } else {
                    state.currentUser = {
                        ...state.currentUser,
                        ...action.payload
                    };
                }
            }
        },
        updateUserTotals: (state, action) => {
            const { totalIncome, totalExpense } = action.payload;
            if (state.currentUser && state.currentUser.user) {
                if (typeof totalIncome === 'number') {
                    state.currentUser.user.totalIncome = totalIncome;
                }
                if (typeof totalExpense === 'number') {
                    state.currentUser.user.totalExpense = totalExpense;
                }
            }
        },
        clearAuthError: (state) => {
            state.error = null;
        },
        signOut: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
        }
    }
});

export const {
    signInStart,
    signInSuccess,
    signInFailure,
    updateCurrentUser,
    updateUserTotals,
    clearAuthError,
    signOut
} = userSlice.actions;

export default userSlice.reducer;