# Auth0 Custom Signing Certificate

Small utility to upload custom signing certificates to Auth0. Update the config.json file to reference your Auth0 account and certificates.

After configuration, just run `node index`

## Appendix: Generating a Self Signed Certificate

`brew install openssl`

Then genereate the private key, the certificate and the pkcs7 file.

```
openssl genrsa -des3 -passout pass:MyPass.123 -out signing.pass.key 2048
openssl rsa -passin pass:MyPass.123 -in signing.pass.key -out signing.key
openssl req -new -key signing.key -out signing.csr
openssl x509 -req -days 365 -in signing.csr -signkey signing.key -out signing.crt
openssl crl2pkcs7 -nocrl -certfile signing.crt -out signing.p7b
```
