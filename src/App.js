import { useState, useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import { useImmer } from 'use-immer';
// import { ToastContainer, toast } from "react-toastify";
import toast, { Toaster } from 'react-hot-toast';

import _ from 'lodash';
// Underline or Underscore

import { ContactContext } from "./context/contactContext";
import {
  AddContact,
  ViewContact,
  Contacts,
  EditContact,
  Navbar,
} from "./components";

import {
  getAllContacts,
  getAllGroups,
  createContact,
  deleteContact,
} from "./services/contactService";

import "./App.css";
import {
  CURRENTLINE,
  FOREGROUND,
  PURPLE,
  YELLOW,
  COMMENT,
} from "./helpers/colors";
// import { contactSchema } from './validations/contactValidation'

const App = () => {
  const [loading, setLoading] = useImmer(false); // useState
  const [contacts, setContacts] = useImmer([]); // useState
  const [filteredContacts, setFilteredContacts] = useImmer([]); // useState
  const [groups, setGroups] = useImmer([]); // useState

  // const [contact, setContact] = useState({});
  // const [errors, setErrors] = useState([]);
  // const [contactQuery, setContactQuery] = useState({ text: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: contactsData } = await getAllContacts();
        const { data: groupsData } = await getAllGroups();

        setContacts(contactsData);
        setFilteredContacts(contactsData);
        setGroups(groupsData);

        setLoading(false);
      } catch (err) {
        console.log(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const createContactForm = async (values) => { // event
    // event.preventDefault();

    try {
      // setLoading((prevLoading) => !prevLoading);
      setLoading(draft => !draft);

      // YUP Validation
      // await contactSchema.validate(contact, { abortEarly: false });

      const { status, data } = await createContact(values);

      /*
       * NOTE
       * 1- Rerender -> forceRender, setForceRender
       * 2- setContact(data)
       */

      if (status === 201) {
        toast.success("مخاطب با موفقیت ساخته شد", { icon: "🔥" });
        // const allContacts = [...contacts, data];

        // setContacts(allContacts);
        // setFilteredContacts(allContacts);

        setContacts(draft => { draft.push(data) });
        setFilteredContacts(draft => { draft.push(data) });

        // setContact({});
        // setErrors([]);
        // setLoading((prevLoading) => !prevLoading);
        setLoading(draft => !draft);
        navigate("/contacts");
      }
    } catch (err) {
      console.log(err.message);
      // console.log(err.inner);
      // setErrors(err.inner);
      setLoading((prevLoading) => !prevLoading);
    }
  };

  // const onContactChange = (event) => {
  //   setContact({
  //     ...contact,
  //     [event.target.name]: event.target.value,
  //   });
  // };

  const confirmDelete = (contactId, contactFullname) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div
            dir="rtl"
            style={{
              backgroundColor: CURRENTLINE,
              border: `1px solid ${PURPLE}`,
              borderRadius: "1em",
            }}
            className="p-4"
          >
            <h1 style={{ color: YELLOW }}>پاک کردن مخاطب</h1>
            <p style={{ color: FOREGROUND }}>
              مطمئنی که میخوای مخاطب {contactFullname} رو پاک کنی ؟
            </p>
            <button
              onClick={() => {
                removeContact(contactId);
                onClose();
              }}
              className="btn mx-2"
              style={{ backgroundColor: PURPLE }}
            >
              مطمئن هستم
            </button>
            <button
              onClick={onClose}
              className="btn"
              style={{ backgroundColor: COMMENT }}
            >
              انصراف
            </button>
          </div>
        );
      },
    });
  };

  const removeContact = async (contactId) => {
    /*
      * NOTE
      * 1- forceRender -> setForceRender(true)
      * 2- Send Request Server
      * 3- Delete local state
      * 4- Delete local state before sending request to server
    */

    // Contacts Copy
    const contactsBackup = [...contacts];

    try {
      // const updatedContacts = contacts.filter(c => c.id !== contactId);

      // setContacts(updatedContacts);
      // setFilteredContacts(updatedContacts);

      setContacts(draft => draft.filter(c => c.id !== contactId));
      setFilteredContacts(draft => draft.filter(c => c.id !== contactId));

      // Sending Delete Request to Server
      const { status } = await deleteContact(contactId);

      toast.error("مخاطب با موفقیت ساخته شد", { icon: "🔥" });

      if (status !== 200) {
        setContacts(contactsBackup);
        setFilteredContacts(contactsBackup);
      }
    } catch (err) {
      console.log(err.message);

      setContacts(contactsBackup);
      setFilteredContacts(contactsBackup);
    }
  };

  // let filterTimeout;
  const contactSearch = _.debounce(query => {
    // setContactQuery({ ...contactQuery, text: event.target.value });

    // const allContacts = contacts.filter((contact) => {
    //   return contact.fullname
    //     .toLowerCase()
    //     .includes(event.target.value.toLowerCase());
    // });

    // clearTimeout(filterTimeout);

    if (!query) return setFilteredContacts([...contacts]);

    // filterTimeout = setTimeout(() => {
    // setFilteredContacts(contacts.filter((contact) => {
    //   return contact.fullname
    //     .toLowerCase()
    //     .includes(query.toLowerCase());
    // }));
    // }, 1000)

    setFilteredContacts(draft => draft.filter(c => c.fullname.toLowerCase().includes(query.toLowerCase())));

    // setFilteredContacts(allContacts);
  }, 1000);

  return (
    <ContactContext.Provider
      value={{
        loading,
        setLoading,
        // contact,
        setContacts,
        setFilteredContacts,
        // contactQuery,
        contacts,
        // errors,
        filteredContacts,
        groups,
        // onContactChange,
        deleteContact: confirmDelete,
        createContact: createContactForm,
        contactSearch,
      }}
    >
      <div className="App">
        {/* <ToastContainer
          rtl={true}
          position="bottom-right"
          theme="colored"
        /> */}
        <Toaster />
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/contacts" />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/contacts/add" element={<AddContact />} />
          <Route path="/contacts/:contactId" element={<ViewContact />} />
          <Route path="/contacts/edit/:contactId" element={<EditContact />} />
        </Routes>
      </div>
    </ContactContext.Provider>
  );
};

export default App;
