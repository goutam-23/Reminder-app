import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { useState, useEffect } from 'react';

// Initialize Firebase

const firebaseConfig = {
    apiKey: "AIzaSyDqzFw5-xHeNhjDl2sSlmSuND9offpIz54",
    authDomain: "reminder-app-956e7.firebaseapp.com",
    projectId: "reminder-app-956e7",
    storageBucket: "reminder-app-956e7.appspot.com",
    messagingSenderId: "810466723079",
    appId: "G-P2WH4424VV"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
}



// Authentication
const auth = firebase.auth()
const provider = new firebase.auth.GoogleAuthProvider()

// Cloud Firestore
const db = firebase.firestore()

// Login page
function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = async () => {
        try {
            await auth.signInWithEmailAndPassword(email, password)
        } catch (error) {
            console.error(error)
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            await auth.signInWithPopup(provider)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div style={{ textAlign: 'center', backgroundColor: '#f0f0f0', padding: '20px' }}>
            <h1 style={{ color: '#333' }}>Login</h1>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: 'none', margin: '5px 0', width: '100%' }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: 'none', margin: '5px 0', width: '100%' }} />
            <button onClick={handleLogin} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', marginRight: '10px', borderRadius: '5px' }}>Log in</button>
            <button onClick={handleGoogleSignIn} style={{ backgroundColor: '#4285f4', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px' }}>Sign in with Google</button>

        </div>
    )
}

function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSignup = async () => {
        try {
            await auth.createUserWithEmailAndPassword(email, password)
        } catch (error) {
            console.error(error)
        }
    }

    const handleGoogleSignUp = async () => {
        try {
            await auth.signInWithPopup(provider)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1 style={{ marginBottom: '20px' }}>New user ?  Signup</h1>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '10px' }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '10px' }} />
            <button onClick={handleSignup} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', marginRight: '10px', borderRadius: '5px' }}>Sign up</button>
            <button onClick={handleGoogleSignUp} style={{ backgroundColor: '#4285f4', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px' }}>Sign up with Google</button>
        </div>
    )
}


// Dashboard
function Dashboard() {
    const [reminders, setReminders] = useState([])

    useEffect(() => {
        const unsubscribe = db.collection('reminders')
            .where('user', '==', auth.currentUser.uid)
            .onSnapshot((querySnapshot) => {
                const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
                setReminders(data)
            })

        return unsubscribe
    }, [])

    const handleAddReminder = async (name, date, time) => {
        try {
            await db.collection('reminders').add({
                name,
                date,
                time,
                user: auth.currentUser.uid,
                completed: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            })
        } catch (error) {
            console.error(error)
        }
    }


    const handleCompleteReminder = async (id, completed) => {
        try {
            await db.collection('reminders').doc(id).update({
                completed,
            })
        } catch (error) {
            console.error(error)
        }
    }

    const handleDeleteReminder = async (id) => {
        try {
            await db.collection('reminders').doc(id).delete()
        } catch (error) {
            console.error(error)
        }
    }
    const handleLogout = async () => {
        try {
            await auth.signOut();
            setUser(null); // update user state to null upon logout
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <div>
            <h1>Reminders</h1>
            <ReminderForm onAddReminder={handleAddReminder} />
            <ReminderList reminders={reminders} onCompleteReminder={handleCompleteReminder} onDeleteReminder={handleDeleteReminder} />
            <button onClick={handleLogout} style={{ margin: '10px', padding: '5px', backgroundColor: 'black', color: 'white' }}>Log out</button>
        </div>

    )
}

// Reminder form
function ReminderForm({ onAddReminder }) {
    const [name, setName] = useState('')
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        onAddReminder(name, date, time)
        setName('')
        setDate('')
        setTime('')
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={{ margin: '10px', padding: '5px' }} />
            <input type="date" placeholder="Date" value={date} onChange={(e) => setDate(e.target.value)} style={{ margin: '10px', padding: '5px' }} />
            <input type="time" placeholder="Time" value={time} onChange={(e) => setTime(e.target.value)} style={{ margin: '10px', padding: '5px' }} />

            <button type="submit" style={{ margin: '10px', padding: '5px', backgroundColor: 'green', color: 'white' }}>Add Reminder</button>
        </form>
    )
}

// Reminder list
function ReminderList({ reminders, onCompleteReminder, onDeleteReminder }) {
    return (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
                <tr style={{ backgroundColor: '#eee', fontWeight: 'bold' }}>
                    <th style={{ padding: '10px', border: '1px solid black' }}>Completed</th>
                    <th style={{ padding: '10px', border: '1px solid black' }}>Task</th>
                    <th style={{ padding: '10px', border: '1px solid black' }}>Date</th>
                    <th style={{ padding: '10px', border: '1px solid black' }}>Time</th>
                    <th style={{ padding: '10px', border: '1px solid black' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {reminders.map((reminder) => (
                    <tr key={reminder.id} style={{ backgroundColor: reminder.completed ? '#d3d3d3' : 'white' }}>
                        <td style={{ padding: '10px', border: '1px solid black' }}>
                            <input type="checkbox" checked={reminder.completed} onChange={(e) => onCompleteReminder(reminder.id, e.target.checked)} style={{

                                backgroundColor: 'blue',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                boxSizing: 'border-box',
                                height: '20px',
                                width: '20px',
                                marginRight: '10px',
                                position: 'relative',
                                top: '4px',
                                cursor: 'pointer'
                            }} />

                        </td>
                        <td style={{ padding: '10px', border: '1px solid black' }}>{reminder.name}</td>
                        <td style={{ padding: '10px', border: '1px solid black' }}>{reminder.date}</td>
                        <td style={{ padding: '10px', border: '1px solid black' }}>{reminder.time}</td>
                        <td style={{ padding: '10px', border: '1px solid black' }}>
                            <button onClick={() => onDeleteReminder(reminder.id)} style={{ backgroundColor: 'red', color: 'white', padding: '8px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}



export default function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });

        return unsubscribe;
    }, []);

    const handleSignup = () => {
        return <SignupPage handleSignup={handleSignup} />;
    };

    const handleLogin = () => {
        return <LoginPage handleLogin={handleLogin} />;
    };

    if (!user) {
        return (
            <>
                <div style={{ textAlign: 'center', padding: '20px', backgroundColor: "blue", color: "white" }}>
                    <h1>Reminder App</h1>
                </div>

                <SignupPage handleSignup={handleSignup} />
                <LoginPage handleLogin={handleLogin} />
            </>
        );
    } else if (user && !user.uid) {

        return <LoginPage handleLogin={handleLogin} />;
    } else {
        return <Dashboard handleLogin={handleLogin} />;
    }
}

