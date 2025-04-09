package main

import (
    "fmt"
    "html/template"
    "os"
    "os/exec"
    "slices"
    "strings"
)

const PROD_HREF = "insetsmusic.web.app/"

const (
    F_HTML = iota
    F_CSS
    F_JS
    F_LEN
)

var ProductionPaths = [F_LEN]string{
    F_CSS: "./src/style.css",
    F_JS: "./src/script.js",
}

var ProductionNames = [F_LEN]string{
    F_CSS: "style",
    F_JS: "script",
}

const SERVER_DIR = "./public/"
const MEDIA_DIR = "./media/"
var CopyFiles = []string {
    "apple-touch-icon.png",
    "favicon-96x96.png",
    "favicon.svg",
    "manifest-192x192.png",
    "manifest-512x512.png",
}
var ServerPaths = []string{
    "style.css",
    "script.js",
    "pwa.js",
    "app.webmanifest",
}
var ServerCmdArgs = [F_LEN][]string {
    F_HTML: {"--html-keep-end-tags", "--html-keep-document-tags"},
    F_JS: {"--js-keep-var-names", "--js-precision", "0"},
}



type HTMLData struct{
    Href string
    Production bool
    Server bool
 bool}

const (
    ARG_HELP = iota
    ARG_PROD
    ARG_DEV
    ARG_MINI
    ARG_SERVER
    ARG_LEN
)

var argName = [ARG_LEN]string{
    ARG_HELP: "help",
    ARG_PROD: "prod",
    ARG_DEV: "dev",
    ARG_MINI: "minify",
    ARG_SERVER: "server",
}

var helpMessage = [ARG_LEN]string{
    ARG_HELP: "this text",
    ARG_PROD: "adds production data",
    ARG_DEV: "developer mode",
    ARG_MINI: "minify files in production mode",
    ARG_SERVER: "build the files for the server",
}


func main() {
    var args []string = os.Args[1:]

    if len(args) < 1 ||
    slices.Contains(args, argName[ARG_HELP]) || (
    !slices.Contains(args, argName[ARG_PROD]) &&
    !slices.Contains(args, argName[ARG_DEV]) &&
    !slices.Contains(args, argName[ARG_SERVER])) {
        fmt.Print(
            "Usage: "+os.Args[0]+" [OPTIONS]\n",
            "\n",
            "Options:\n",
        )
        for i := range ARG_LEN {
            fmt.Println("\t", argName[i], "\t", helpMessage[i])
        }
        return
    }

    tmpl, err := template.ParseFiles("./src/index.html")
    if err != nil {
        fmt.Fprintln(os.Stderr, "template.ParseFiles", err)
        panic(1)
    }

    if slices.Contains(args, argName[ARG_SERVER]) {
        fmt.Println("Server");

        var htmldata = HTMLData{
            Href: PROD_HREF,
            Production: false,
            Server: true,
        }

        fd, err := os.OpenFile(
            SERVER_DIR+"index.html",
            os.O_CREATE|os.O_WRONLY,
            0o644,
        )

        if err != nil {
            fmt.Fprint(os.Stderr, "os.OpenFile", err)
            panic(1)
        }
        defer fd.Close()

        err = fd.Truncate(0)
        if err != nil {
            fmt.Fprintln(os.Stderr, "Truncate", err)
            panic(1)
        }

        err = tmpl.Execute(fd, htmldata)
        if err != nil {
            fmt.Fprintln(os.Stderr, "template Execute ", err)
            panic(1)
        }

        var (
            dst *os.File
            src *os.File
        )

        for  _, fname := range CopyFiles  {
            dst, err = os.OpenFile(
                SERVER_DIR+fname,
                os.O_CREATE|os.O_WRONLY,
                0o644,
            )

            if err != nil {
                if os.IsExist(err) {
                    continue
                }
                fmt.Fprint(os.Stderr, "os.OpenFile", err)
                panic(1)
            }
            src, err = os.OpenFile(MEDIA_DIR+fname, os.O_RDONLY, 0o644)
            if err != nil {
                fmt.Fprint(os.Stderr, "os.OpenFile", err)
                panic(1)
            }

            if _, err = src.WriteTo(dst); err != nil {
                fmt.Fprintln(os.Stderr, "WriteTo", fname, err)
                panic(1)
            }

            src.Close()
            dst.Close()
        }

        cmd :=  exec.Command("minify")
        cmd.Args = append(
            cmd.Args,
            "./public/index.html",
            "-o",
            "./public/index.html",
        )

        if out, err := cmd.Output(); err != nil {
            fmt.Fprintln(os.Stderr, "cmd.Run minifier", err)
            panic(1)
        } else {
            fmt.Println(string(out));
        }

        for _, name := range ServerPaths {
            cmd =  exec.Command("minify")
            cmd.Args = append(
                cmd.Args,
                "./src/"+name,
                "-o",
                SERVER_DIR+name,
            )
            if strings.Contains(name, ".js") {
                cmd.Args = append(cmd.Args, ServerCmdArgs[F_JS]...)
            }

            if out, err := cmd.Output(); err != nil {
                fmt.Fprintln(os.Stderr, "cmd.Run minifier", name, err)
                panic(1)
            } else {
                fmt.Println(string(out));
            }
        }

    }

    if slices.Contains(args, argName[ARG_PROD]) {
        fmt.Println("Production");

        var htmldata = HTMLData{
            Href: PROD_HREF,
            Production: true,
            Server: false,
        }

        fd, err := os.OpenFile(
            "index.html",
            os.O_CREATE|os.O_WRONLY,
            0o644,
        )

        if err != nil {
            fmt.Fprintln(os.Stderr, "os.OpenFile", err)
            os.Exit(1)
        }
        defer fd.Close()

        err = fd.Truncate(0)
        if err != nil {
            fmt.Fprintln(os.Stderr, "Truncate", err)
            os.Exit(1)
        }

        for i := F_CSS; i < F_LEN; i += 1 {
            path := ProductionPaths[i]
            templateName := ProductionNames[i]

            var bytes []byte
            bytes, err = os.ReadFile(path)
            s := string(bytes)
            _, err = tmpl.New(templateName).Parse(s)

            if err != nil {
                fmt.Fprintln(os.Stderr, "template.New ", err)
                panic(1)
            }
        }

        err = tmpl.Execute(fd, htmldata)
        if err != nil {
            fmt.Fprintln(os.Stderr, "template Execute ", err)
            panic(1)
        }

        if slices.Contains(args, argName[ARG_MINI]) {
            cmd :=  exec.Command("minify")
            cmd.Args = append(
                cmd.Args,
                "index.html",
                "-o",
                "index.html",
            )
            cmd.Args = append(cmd.Args, ServerCmdArgs[F_HTML]...)
            cmd.Args = append(cmd.Args, ServerCmdArgs[F_JS]...)

            if out, err := cmd.Output(); err != nil {
                fmt.Fprintln(os.Stderr, "cmd.Run minifier", err)
                panic(1)
            } else {
                fmt.Println(string(out));
            }
        }

    } else if slices.Contains(args, argName[ARG_DEV]) {
        fmt.Println("Developer");

        var htmldata = HTMLData{
            Href: "./",
            Production: false,
            Server: false,
        }

        fd, err := os.OpenFile("dev.html", os.O_CREATE|os.O_WRONLY, 0o644)

        if err != nil {
            fmt.Fprint(os.Stderr, "os.OpenFile", err)
            panic(1)
        }
        defer fd.Close()

        err = fd.Truncate(0)
        if err != nil {
            fmt.Fprintln(os.Stderr, "Truncate", err)
            panic(1)
        }

        err = tmpl.Execute(fd, htmldata)
        if err != nil {
            fmt.Fprintln(os.Stderr, "template Execute ", err)
            panic(1)
        }
    }
}
