package main

import (
	"fmt"
	"github.com/gorilla/websocket"
    "math/rand"
	"net/http"
    "time"
)

type msg struct {
    Type string
    Data string
    Key string
}

type ClientDetails struct {
    Offer string
    Conn1 *websocket.Conn
    Conn2 *websocket.Conn
}

const storageLimit = 1000
var data map[string]ClientDetails

func main() {
    rand.Seed(time.Now().UTC().UnixNano())
    data = make(map[string]ClientDetails)
    data["a"] = ClientDetails{}

	http.HandleFunc("/", handler)

	panic(http.ListenAndServe(":3004", nil))
}

func handler(w http.ResponseWriter, r *http.Request) {
	conn, err := websocket.Upgrade(w, r, w.Header(), 1024, 1024)
	if err != nil {
		http.Error(w, "Could not open websocket connection", http.StatusBadRequest)
        return
	}

	go handleMessage(conn)
}

func handleMessage(conn *websocket.Conn) {
	for {
		m := msg{}

		if err := conn.ReadJSON(&m); err != nil {
			fmt.Println("Error reading JSON", err)
            return
		}

		fmt.Printf("Message: %#v\n", m)
        switch m.Type {
        case "setOffer":
            handleOffer(conn, &m)
        case "getOffer":
            handleGetOffer(conn, &m)
        case "setAnswer":
            handleAnswer(conn, &m)
        case "ice":
            handleIce(conn, &m)
        }
    }
}

func handleOffer(conn *websocket.Conn, m *msg) {
    if (len(data) >= storageLimit) {
        data = make(map[string]ClientDetails)
    }

    key := randomKey()
    // conn.WriteJSON(&msg{ Key: key })
    data[key] = ClientDetails{ Offer: m.Data, Conn1: conn }
}

func handleGetOffer(conn *websocket.Conn, m *msg) {
    game := data[m.Key]
    conn.WriteJSON(game.Offer)
    data[m.Key] = ClientDetails{ Offer: data[m.Key].Offer, Conn1: data[m.Key].Conn1, Conn2: conn }
}

func handleAnswer(conn *websocket.Conn, m *msg) {
    client1 := data[m.Key]
    client1.Conn1.WriteJSON(m.Data)
}

func handleIce(conn *websocket.Conn, m *msg) {
    client1 := data[m.Key]
    if (client1.Conn1 != nil) {
        client1.Conn1.WriteJSON(m.Data)
    }
    if (client1.Conn2 != nil) {
        client1.Conn2.WriteJSON(m.Data)
    }
}

func randomKey() string {
    return "a"
    // letter := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

    // b := make([]rune, 4)
    // for i := range b {
    //     b[i] = letter[rand.Intn(len(letter))]
    // }
    // return string(b)
}
