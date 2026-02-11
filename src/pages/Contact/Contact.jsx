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
        <a
          href="https://www.linkedin.com/in/diegomarbar/"
          className="contact_elements"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconBrandLinkedin size={100} />
        </a>

        <a
          href="https://github.com/diegomardev"
          className="contact_elements"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconBrandGithub size={100} />
        </a>

        <a
          href="mailto:diegomarbar@gmail.com"
          className="contact_elements"
        >
          <IconMail size={100} />
        </a>

        <a
          href="https://www.instagram.com/diegomarfpv"
          className="contact_elements"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconBrandInstagram size={100} />
        </a>
      </div>
    </>
  );
}


export default Contact;
