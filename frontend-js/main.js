import Search from './module/search'
import Chat from './module/chat'
new Search()

if(document.querySelector("#chat-wrapper")) {
    new Chat()
}