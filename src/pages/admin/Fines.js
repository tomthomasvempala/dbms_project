import { arrayUnion, collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { db } from '../../firebase-config'
import './Fines.css'

const Fines = () => {
    const [amount, setAmount] = useState('')
    const [due, setDue] = useState('')
    const [user, setUser] = useState(null)
    const [issuedBooks, setIssuedBooks] = useState(null)
    const [book, setBook] = useState('')
    const [fineId, setFineId] = useState('')
    const [allFines, setAllFines] = useState([])

    const getUser = async () => {
        const currentUser = user ? doc(db, "users", user) : null
        const currentUserData = await getDoc(currentUser);
        // console.log(currentUserData.data())
        const temp = currentUserData.data()
        const issuedBooks = temp.issuedBooks
        setIssuedBooks(issuedBooks)
        console.log(issuedBooks)
    }

    const getSelectedValue = (e) => {
        setBook(e.target.value)
    }

    const issueFine = async () => {
        // add fine to user
        const fineObj = {
            user: user,
            book: book,
            amount: amount,
            due: due
        }
        const finedocId = doc(collection(db, "fines"));
        // console.log(bookdocId.id)
        setFineId(finedocId.id)
        await setDoc(finedocId, fineObj)
        updateUserFine()
    }
    const updateUserFine = async () => {
        if (fineId == '') return;
        const userDoc = doc(db, "users", user)
        await updateDoc(userDoc, {
            fines: arrayUnion(fineId)
        })
    }
    const getAllFines = async () => {
        const finesCollectionRef = collection(db, "fines")
        const data = await getDocs(finesCollectionRef)
        setAllFines(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    }
    useEffect(() => {
        getAllFines()
        updateUserFine()
    }, [fineId])
    return (
        <div className='fines-container'>
            <div className='add-fines'>
                <h3>Add fine</h3>
                <input className='fines-input' placeholder='Enter User ID' onChange={e => setUser(e.target.value)} />
                <div><button className='fines-button' onClick={getUser}>Get issued books of user</button></div>
                {issuedBooks && issuedBooks.length > 0
                    ? <div>
                        <label>Select book to issue fine</label>
                        <select className='fines-input' defaultValue="select" onChange={e => getSelectedValue(e)}>
                            <option disabled value="select">select</option>
                            {issuedBooks.map(book => (
                                <option key={book} value={book}>{book}</option>
                            ))}
                        </select>
                        <div>
                            <label className="fines-temp1">Enter amount</label>
                            <input className='fines-input' placeholder='enter amount' onChange={e => setAmount(e.target.value)} />
                        </div>
                        <label className="fines-temp2">Enter due date</label>
                        <input className='fines-input' type="date" onChange={e => setDue(e.target.value)} />
                        <div>
                            <button className='fines-button' onClick={issueFine}>Issue Fine</button>
                        </div>
                    </div>
                    : issuedBooks === null ? null : <p>User doesn't have any issued books</p>}
            </div>
            <div className='issued-fines'>
                <h3>Issued fines</h3>
                {allFines.map(fine => (
                    <div>
                        <p>Issued to: {fine.user}</p>
                        <p>Book associated: {fine.book}</p>
                        <p>Amount: {fine.amount}</p>
                        <p>Due date: {fine.due}</p>
                    </div>
                ))}
                {allFines.length === 0 ? <p>There are no issued fines</p> : null}
            </div>
        </div>
    )
}

export default Fines