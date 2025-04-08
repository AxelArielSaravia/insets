package main

import (
    "fmt"
    "html/template"
    "os/exec"
    "os"
    "slices"
)

const PROD_HREF = "./";

const (
    F_HTML = iota
    F_CSS
    F_JS
    F_LEN
)

var FPaths = [F_LEN]string{
    F_HTML: "./src/index.html",
    F_CSS: "./src/style.css",
    F_JS: "./src/script.js",
}

var FMinPaths = [F_LEN]string{
    F_HTML: "./src/index.html",
    F_CSS: "./src/style.mini.css",
    F_JS: "./src/script.mini.js",
}

var TemplateNames = [F_LEN]string{
    F_HTML: "index",
    F_CSS: "style",
    F_JS: "script",
}

type HTMLData struct{
    Href string
    Production bool
}

const (
    ARG_HELP = iota
    ARG_PROD
    ARG_DEV
    ARG_MINI
    ARG_LEN
)

var argName = [ARG_LEN]string{
    ARG_HELP: "help",
    ARG_PROD: "prod",
    ARG_DEV: "dev",
    ARG_MINI: "minify",
}

var helpMessage = [ARG_LEN]string{
    ARG_HELP: "this text",
    ARG_PROD: "adds production data",
    ARG_DEV: "developer mode",
    ARG_MINI: "minify files",
}


func main() {
    var args []string = os.Args[1:]

    if len(args) < 1 ||
    slices.Contains(args, argName[ARG_HELP]) || (
    !slices.Contains(args, argName[ARG_PROD]) &&
    !slices.Contains(args, argName[ARG_DEV])) {
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

    var production = slices.Contains(args, argName[ARG_PROD]);

    var htmldata = HTMLData{
        Production: production,
        Href: "./",
    }

    var fd *os.File
    var err error
    if production {
        fmt.Println("Production");

        htmldata.Href = PROD_HREF
        paths := FPaths

        fd, err = os.OpenFile("index.html", os.O_CREATE|os.O_WRONLY, 0o644)

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

        minify := slices.Contains(args, argName[ARG_MINI])
        if minify {
            fmt.Println("Minify")

            paths = FMinPaths
            cmd := exec.Command("bun")
            cmd.Args = append(
                cmd.Args,
                "build",
                FPaths[F_JS],
                "--outfile",
                FMinPaths[F_JS],
                "--minify-whitespace",
            )

            if out, err := cmd.Output(); err != nil {
                fmt.Fprintln(os.Stderr, "cmd.Run JS minifier", err)
                panic(1)
            } else {
                fmt.Println(string(out));
            }

            cmd =  exec.Command("minify")
            cmd.Args = append(
                cmd.Args,
                FPaths[F_CSS],
                "-o",
                FMinPaths[F_CSS],
            )

            if out, err := cmd.Output(); err != nil {
                fmt.Fprintln(os.Stderr, "cmd.Run JS minifier", err)
                panic(1)
            } else {
                fmt.Println(string(out));
            }
       }

        var tmpl *template.Template = nil
        for i := 0; i < F_LEN; i += 1 {
            path := paths[i]
            templateName := TemplateNames[i]

            var bytes []byte
            bytes, err = os.ReadFile(path)
            s := string(bytes)
            if tmpl == nil {
                tmpl, err = template.New(templateName).Parse(s)
            } else {
                _, err = tmpl.New(templateName).Parse(s)
            }
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

        if minify {
            cmd :=  exec.Command("minify")
            cmd.Args = append(
                cmd.Args,
                "index.html",
                "-o",
                "index.html",
                "--html-keep-end-tags",
            )
            if out, err := cmd.Output(); err != nil {
                fmt.Fprintln(os.Stderr, "cmd.Run JS minifier", err)
                panic(1)
            } else {
                fmt.Println(string(out));
            }
        }

    } else {
        fmt.Println("Developer");
        fd, err = os.OpenFile("dev.html", os.O_CREATE|os.O_WRONLY, 0o644)

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

        var tmpl *template.Template
        tmpl, err = template.ParseFiles("./src/index.html")
        if err != nil {
            fmt.Fprintln(os.Stderr, "template.ParseFiles", err)
            panic(1)
        }
        err = tmpl.Execute(fd, htmldata)
        if err != nil {
            fmt.Fprintln(os.Stderr, "template Execute ", err)
            panic(1)
        }
    }
}
