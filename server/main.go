package main

import (
	"fmt"
	"github.com/gorilla/websocket"
    "math/rand"
	"net/http"
)

var keys = [...]string { "the", "and", "for", "are", "but", "not", "you", "all", "any", "can", "her", "was", "one", "our", "out", "day", "get", "has", "him", "his", "how", "man", "new", "now", "old", "see", "two", "way", "who", "boy", "did", "its", "let", "put", "say", "she", "too", "use", "dad", "mom", "act", "bar", "car", "dew", "eat", "far", "gym", "hey", "ink", "jet", "key", "log", "mad", "nap", "odd", "pal", "ram", "saw", "tan", "urn", "vet", "wed", "yap", "zoo", "why", "try" }


type msg struct {
    Data string
    Type string
    Key string
}

type Client1 struct {
    Offer string
    Conn *websocket.Conn
}

const storageLimit = 100
var data map[string]Client1

func main() {
    data = make(map[string]Client1)
	http.HandleFunc("/", handler)

	panic(http.ListenAndServe(":3004", nil))
}

func handler(w http.ResponseWriter, r *http.Request) {
	conn, err := websocket.Upgrade(w, r, w.Header(), 1024, 1024)
	if err != nil {
		http.Error(w, "Could not open websocket connection", http.StatusBadRequest)
        return
	}

	go echo(conn)
}

func echo(conn *websocket.Conn) {
	for {
		m := msg{}

		if err := conn.ReadJSON(&m); err != nil {
			fmt.Println("Error reading json.", err)
		}

		fmt.Printf("Got message: %#v\n", m)
        switch m.Type {
        case "offer":
            handleOffer(conn, &m)
        case "getOffer":
            handleGetOffer(conn, &m)
        case "answer":
            handleAnswer(conn, &m)
        }
    }
}

func handleOffer(conn *websocket.Conn, m *msg) {
    if (len(data) >= storageLimit) {
        data = make(map[string]Client1)
    }

    key := randomKey()
    conn.WriteJSON(key)
    game := Client1{ Offer: m.Data, Conn: conn }
    data[key] = game
}

func handleGetOffer(conn *websocket.Conn, m *msg) {
    game := data[m.Key]
    conn.WriteJSON(game.Offer)
}

func handleAnswer(conn *websocket.Conn, m *msg) {
    client1 := data[m.Key]
    client1.Conn.WriteJSON(m.Data)
}

func randomKey() string {
    return keys[rand.Intn(len(keys))]
}
