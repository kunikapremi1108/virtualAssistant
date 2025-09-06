// Simple in-memory database for development when MongoDB is not available
let users = []
let nextId = 1

export const memoryDb = {
    // User operations
    createUser: (userData) => {
        const user = { ...userData, _id: nextId++, createdAt: new Date() }
        users.push(user)
        return user
    },
    
    findUserByEmail: (email) => {
        return users.find(user => user.email === email) || null
    },
    
    findUserById: (id) => {
        return users.find(user => user._id === id) || null
    },
    
    updateUser: (id, updateData) => {
        const userIndex = users.findIndex(user => user._id === id)
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updateData }
            return users[userIndex]
        }
        return null
    },
    
    // Clear all data (for testing)
    clear: () => {
        users = []
        nextId = 1
    }
}
