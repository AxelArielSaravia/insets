package main

import (
    "fmt"
    "html/template"
    "slices"
    "os"
    "os/exec"
    "errors"
)

const PROD_HREF = "./";
const BUILDER_DIR = "./builder"

const (
    BUILDER_HTML = iota
    BUILDER_CSS
    BUILDER_JS
    BUILDER_LEN
)

var DevBuildersPaths = [BUILDER_LEN]string{
    BUILDER_HTML: "./src/index.html",
    BUILDER_CSS: "./src/style.css",
    BUILDER_JS: "./src/script.js",
}

var ProdBuildersPaths = [BUILDER_LEN]string{
    BUILDER_HTML: "./src/index.html",
    BUILDER_CSS: "./builder/style.css",
    BUILDER_JS: "./builder/script.js",
}
var BuildersTemplate = [BUILDER_LEN]string{
    BUILDER_HTML: "index",
    BUILDER_CSS: "style",
    BUILDER_JS: "script",
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
    ARG_MINI: "mini",
}

var helpMessage = [ARG_LEN]string{
    ARG_HELP: "this text",
    ARG_PROD: "adds production data",
    ARG_DEV: "developer mode",
    ARG_MINI: "minify html files",
}


func main() {
    var args []string = os.Args[1:]

    if len(args) < 1 ||
    slices.Contains(args, argName[ARG_HELP]) || (
    !slices.Contains(args, argName[ARG_MINI]) &&
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


    var buildersPaths [BUILDER_LEN]string
    if (production) {
        buildersPaths = ProdBuildersPaths
        fd, err = os.OpenFile("index.html", os.O_CREATE|os.O_WRONLY, 0o644)
    } else {
        buildersPaths = DevBuildersPaths
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

    if (production) {
        cmd := exec.Command("bun")
        if errors.Is(cmd.Err, exec.ErrDot) {
            cmd.Err = nil
        }
        cmd.Args = append(cmd.Args,
            "build",
            DevBuildersPaths[BUILDER_JS],
            "--outdir",
            BUILDER_DIR,
            "--minify-whitespace",
        )
        if err := cmd.Run(); err != nil {
            fmt.Fprint(os.Stderr, "cmd.Run ", err);
            os.Exit(1);
        }

        cmd = exec.Command("minify");
        if errors.Is(cmd.Err, exec.ErrDot) {
            cmd.Err = nil
        }
        cmd.Args = append(cmd.Args,
            "-o",
            ProdBuildersPaths[BUILDER_CSS],
            DevBuildersPaths[BUILDER_CSS],
        )
        if err := cmd.Run(); err != nil {
            fmt.Fprint(os.Stderr, "cmd.Run ", err);
            os.Exit(1);
        }
    }

    var tmpl *template.Template = nil
    for i := 0; i < BUILDER_LEN; i += 1 {
        path := buildersPaths[i]
        templateName := BuildersTemplate[i]

        var bytes []byte
        bytes, err = os.ReadFile(path)
        s := string(bytes)
        if tmpl == nil {
            tmpl, err = template.New(templateName).Parse(s)
        } else {
            _, err = tmpl.New(templateName).Parse(s)
        }
        if err != nil {
            fmt.Fprint(os.Stderr, "template.New ", err)
            os.Exit(1)
        }
    }

    err = tmpl.Execute(fd, htmldata)
    if err != nil {
        fmt.Fprintln(os.Stderr, "template Execute ", err)
        os.Exit(1)
    }
    if (production) {
        cmd := exec.Command("minify")
        if errors.Is(cmd.Err, exec.ErrDot) {
            cmd.Err = nil
        }
        cmd.Args = append(cmd.Args,
            "-o",
            "./index.html",
            "./index.html",
        )

        if err := cmd.Run(); err != nil {
            fmt.Fprint(os.Stderr, "cmd.Run ", err)
            os.Exit(1);
        }
        err := os.Remove(ProdBuildersPaths[BUILDER_JS])
        if err != nil {
            fmt.Fprint(os.Stderr, "os.Remove ", err)
            os.Exit(1)
        }
        err = os.Remove(ProdBuildersPaths[BUILDER_CSS])
        if err != nil {
            fmt.Fprint(os.Stderr, "os.Remove ", err)
            os.Exit(1)
        }
    }
}
