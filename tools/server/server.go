package main

import (
    "fmt"
    "net/http"
    "os"
    "slices"
)

const PORT string = ":3030"

type Logger struct {
    next http.Handler
}
func (l *Logger) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    fmt.Println(r.Method, r.URL)
    l.next.ServeHTTP(w,r)
}

func main() {
    var args []string = os.Args[1:]

	if slices.Contains(args, "help") {
		fmt.Println("server PORT [public]");
		return
	}
	port := PORT

    if (len(args) > 0) {
        port = ":"+args[0];
    }

    var fileServer http.Handler
    mux := http.NewServeMux();

    if slices.Contains(args, "public") {
        fileServer = http.FileServer(http.Dir("./public"))
    } else {
        fileServer = http.FileServer(http.Dir("./"))
    }
    mux.Handle("/", fileServer)

    fmt.Printf("Starting server on http://127.0.0.1%s\n", port)

    err := http.ListenAndServe(port, &Logger{next: mux})
    panic(err);
}
