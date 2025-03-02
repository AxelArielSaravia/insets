package main

import (
    "fmt"
    "html/template"
    "slices"
    "os"
)

const PROD_HREF = "./";

var builders = []Builder{
    {path: "./src/index.html", template: "index", ext: "html"},
    {path: "./src/style.css", template: "style", ext: "css"},
    {path: "./src/script.js", template: "script", ext: "js"},
    {path: "./src/scriptTheme.js", template: "scriptTheme", ext: "js"},
}

type HTMLData struct{
    Href string
    Production bool
}

const (
    ARG_HELP = iota
    ARG_PROD
    ARG_MINI
    ARG_LEN
)


var argName = [ARG_LEN]string{
    ARG_HELP: "help",
    ARG_PROD: "prod",
    ARG_MINI: "mini",
}

var helpMessage = [ARG_LEN]string{
    ARG_HELP: "this text",
    ARG_PROD: "adds production data",
    ARG_MINI: "minify html files",
}

type Builder struct{
    path string
    template string
    ext string
}

func main() {
    var args []string = os.Args[1:]

    if len(args) < 1 || slices.Contains(args, argName[ARG_HELP]) {
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

    var production = false
    var htmldata = HTMLData{
        Production: production,
        Href: "./",
    }

    if production = slices.Contains(args, argName[ARG_PROD]); production {
        htmldata = HTMLData{
            Production: production,
            Href: PROD_HREF,
        }
    }

    var fd *os.File
    var err error


    if (production) {
        fd, err = os.OpenFile("index.html", os.O_CREATE|os.O_WRONLY, 0o644)
    } else {
        fd, err = os.OpenFile("dev.html", os.O_CREATE|os.O_WRONLY, 0o644)
    }

    if err != nil {
        fmt.Fprint(os.Stderr, "os.OpenFile", err)
        os.Exit(1)
    }
    defer fd.Close()

    err = fd.Truncate(0)
    if err != nil {
        fmt.Fprint(os.Stderr, "Truncate", err)
        os.Exit(1)
    }

    var tmpl *template.Template = nil
    for _, b := range builders {
        var bytes []byte
        bytes, err = os.ReadFile(b.path)
        s := string(bytes)
        if tmpl == nil {
            tmpl, err = template.New(b.template).Parse(s)
        } else {
            _, err = tmpl.New(b.template).Parse(s)
        }
        if err != nil {
            fmt.Fprint(os.Stderr, "template.New ", err)
            os.Exit(1)
        }
    }

    err = tmpl.Execute(fd, htmldata)
    if err != nil {
        fmt.Fprintln(os.Stderr, "template Execute", err)
        os.Exit(1)
    }
}
