# OmegaPM (JavaScript)

OmegaPM is a tool to communicate securely with package developers. It answers the question: "do I need to update any of my dependencies?" in cases when there are widespread security issues, deprecated packages, or other critical notices.

For the Ruby gem source code, see <a href="https://github.com/mapmeld/omegapm-ruby">omegapm-ruby</a>.

## Installation

```bash
npm install -g omegapm
```

## Receiving security messages

If any of your NodeJS dependencies have a public key in their package.json, developers who use OmegaPM can send you signed messages.

```bash
omegapm status
---
example-package:
1/11/2016: security update: you should update your database module to send encrypted data
---
```

If none of your dependencies have a public key, you will see a message confirming that.

```bash
omegapm status
> none of your dependencies have a public key, so they cannot be used with OmegaPM
```

If you expect a lot of messages (for example, updating an old package), you can output to a text file:

```bash
omegapm status > todo.txt
```

### What's special about signed messages?

A PGP-signed message allows you to know for sure that the message that you received comes from the original developer and has not been modified.

It doesn't require the developer to sign up for any service or divulge any information... they just use existing GPG tools to sign their messages.

### How do I know these messages are signed?

Participating developers include a public key in their package, which you downloaded over NPM. When your command-line tool contacts omegapm.org, it receives a list of messages for each package. These messages are only accepted and displayed to you if your computer can verify that they were signed, and the signature matches the developer's public key. OmegaPM, man-in-the-middle attacks, and other tricks cannot forge the developer's signature.

### Can I contact developers using their PGP public key?

If a developer provides an e-mail and public key, you may be able to encrypt e-mails to them. Check for a notice in their README, package.json,
or other sources to see whether they are prepared to receive encrypted e-mail.

## Instructions for a Package Developer

### Setup

If you haven't created a key before, install GPG and run this: ```gpg --gen-key```

When you have a key, run

```bash
gpg --export --armor emailYouUsed@example.com > /path/to/package/public_key.asc
```

In your package code, add the file name of your public key (for example as public_key.asc). Never share your private key.

Include the public key in package.json:

```javascript
{
  "name": "omegapm",
  "version": "1.0.0",
  "publicKey": "public_key.asc"
}
```

### Sending messages

On https://omegapm.org/new-js/ enter your package name, and versions it applies to (for example, 1.0.X).

Save your message as a .txt file, then use the gpg command line tool to sign it:

Now paste or drop the signed .txt file into the browser. Once it's confirmed, the message will be available to users.

### Receiving messages

By including your public key and e-mail address in your repo, it increases the chances that you may receive encrypted e-mails from developers.
The current leading tool for receiving PGP e-mail is Thunderbird with a PGP extension.

## License

GPLv3+
