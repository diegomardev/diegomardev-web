import { useState } from 'react';
import confetti from 'canvas-confetti';
import './Contact.css';
import Navbar from '../../components/Navbar/Navbar';
import { IconBrandLinkedin, IconBrandGithub, IconMail, IconBrandInstagram } from '@tabler/icons-react';

function Contact() {
  return (
    <>
      <div>
        <Navbar />
      </div>
      <h1 className="read-the-docs">
        Contact
      </h1>
      <div className='contact'>
        <a href="https://www.linkedin.com/in/diegomarbar/" className="contact_elements">
          <IconBrandLinkedin size={100} />
        </a>
        <a href="https://github.com/diegomardev" className="contact_elements">
          <IconBrandGithub size={100} />
        </a>
        <a href="mailto:diegomarbar@gmail.com" className="contact_elements">
          <IconMail size={100} />
        </a>
        <a href="https://www.instagram.com/_.diegomar._" className="contact_elements">
          <IconBrandInstagram size={100} />
        </a>
      </div>
    </>
  );
}

export default Contact;