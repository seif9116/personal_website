## Hosting a Fork of Compiler Explorer

This summer I spent some time configuring a custom fork of Compiler Explorer
for the custom languages we implement at my university. 

### Initial setup

First thing to do is get access to the root user.

```
ssh root@<IP>
```

### Create a user
It is a good idea to set up a separate user from `root` for security.
As this user we can still use `sudo` to modify root owned files, just
like we are used to on a local machine.

```
adduser justin
usermod -aG sudo justin
su - justin
```

### Setup SSH for user

Our new user has its own home directory. Since `~/.ssh` lives heres,
we need to reconstruct our ssh setup so we can login with `ssh justin@<IP>`
instead of root.

```
sudo chmod 700 /home/justin/.ssh
sudo chmod 600 /home/justin/.ssh/authorized_keys
sh -c 'echo "<PUBLIC_KEY>" >> /home/justin/.ssh/authorized_keys'
```

Inspect `/etc/ssh/sshd_config` to see ensure the following fields
are set:

```
Port 22
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
```

## HTTP NGINX setup

First we will setup a config that forwards HTTP connections to a local port.
NGINX configuration is based primarily on two directories `/etc/nginx/sites-available`
and `/etc/nginx/sites-enabled`. The former is where all your configs can live, the later
is where soft symbolic links should be placed to an avaiable config. All files
in `sites-enabled` are run by nginx.


### Firewall config

```
$ sudo ufw allow 80
$ sudo ufw allow 22
$ sudo ufw enable
$ sudo ufw status
Status: active

To                         Action      From
--                         ------      ----
80                         ALLOW       Anywhere
80 (v6)                    ALLOW       Anywhere (v6)

```

Next lets drop in a basic reverse proxy that will forward
requests coming in over port 80 to 8080

Create `/etc/nginx/sites-available/reverse-proxy`

```
server {
    listen 80;
    listen [::]:80;
    server_name _;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Symlink to the directory containing the enabled subset of configs in `sites-available`
```
sudo ln -s /etc/nginx/sites-available/reverse-proxy /etc/nginx/sites-enabled/
```

Verify the config is syntactically correct and restart the daemon
```
sudo nginx -t
sudo systemctl reload nginx
```

Create a simple `index.html` and run `python3 -m http.sever 8080`

Then we can `curl` from our host machine and see indeed that the site is reachable!

```
➜  ~ curl -X GET http://<IP>:80

<!DOCTYPE html>
<html lang="en">
<head>
</head>
<body>
    <h1>Hello, from NGINX</h1>
</body>
</html>
➜  ~
```

## HTTPS

In order to provide https, we need a domain. My favourite domain vendor is `porkbun`. They have generate auto-renewing SSL
certificates that you can download. After obtaining an ssl certificate for our domain, we can set revise our nginx configuration.

```
server {
    listen 80;
    listen [::]:80;
    server_name cmput415compilerexplorer.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name cmput415compilerexplorer.com;

    ssl_certificate /etc/nginx/ssl/domain.cert.pem;
    ssl_certificate_key /etc/nginx/ssl/private.key.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

This config does a couple of things. First, it returns a 301 see other on HTTP connections coming through port 80.
The clients browser will interpret as a redirect to use https.

The location `/` means the root path of the url will be proxied. The proxy settings inside the location block
describe how requests on the root url `/` should be forwarded. 

The location directive is useful for paritioning
different paths to their own services. For example, sending requests from `/api` to your node server and `/` to
server your static files.

```
nginx -t # verify the configs
systemctl restart nginx
systemctl status nginx 
```

