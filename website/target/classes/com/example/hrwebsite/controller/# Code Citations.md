# Code Citations

## License: unknown
https://github.com/skalia0594/Myfytness/tree/225533640567422fd8e7208e9009e7efa4fd0988/routes/verifyToken.js

```
= (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access Denied');
    try {
        const verified = jwt.verify(token,
```


## License: unknown
https://github.com/sathwikveeramaneni/kapla/tree/1f886233b2b8d2e3551cf426a1e9548d1b050694/controller/user.js

```
, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Email not found');
    const validPass =
```


## License: MIT
https://github.com/kito0/raven/tree/cc419398df73a488b76751c91988069979f9897c/controllers/user.controller.js

```
).send('Email not found');
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).send('Invalid password');
    const token = jwt.sign({
```


## License: unknown
https://github.com/csharshtiwari/prehistory/tree/8fb7e603986a648abe014d808a3b5a76a048fa20/login/frontend/src/App.js

```
email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e)
```


## License: unknown
https://github.com/mayankag30/LinkedIn__Profile/tree/ea6cccec3f26b5e22ced154f62df3b1c8e307570/src/components/Login/Login.js

```
placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) =>
```

