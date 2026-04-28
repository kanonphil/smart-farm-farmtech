import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import { getAllRooms, getMessages, closeRoom } from '../../api/chatApi'
import useAuthStore from '../../store/authStore'
import styles from './ChatManage.module.css'
import { MdSend, MdChatBubbleOutline } from 'react-icons/md'

const WS_URL = 'ws://localhost:8080/ws/chat'

const ChatManage = () => {
  const { token, showAlert } = useAuthStore()
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const clientRef = useRef(null)
  const messageEndRef = useRef(null)
  const subscriptionRef = useRef(null)

  // 전체 채팅방 목록 로드
  useEffect(() => {
    loadRooms()
  }, [])

  // 메시지 추가될 때마다 스크롤 아래로
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // WebSocket 연결 (최초 1회)
  useEffect(() => {
    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: { Authorization: token },
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true)
        console.log('[CHAT] WebSocket 연결됨')
      },
      onDisconnect: () => setConnected(false),
    })
    client.activate()
    clientRef.current = client

    return () => client.deactivate()
  }, [])

  // 채팅방 선택 시 메시지 로드 + 구독 변경
  useEffect(() => {
    if (!selectedRoom || !connected) return

    // 이전 구독 해제
    subscriptionRef.current?.unsubscribe()

    // 메시지 이력 로드
    getMessages(selectedRoom.roomId).then(setMessages)

    // 새 구독
    subscriptionRef.current = clientRef.current.subscribe(
      `/topic/chat/${selectedRoom.roomId}`,
      (msg) => {
        const newMsg = JSON.parse(msg.body)
        setMessages((prev) => [...prev, newMsg])
      }
    )
  }, [selectedRoom, connected])

  const loadRooms = async () => {
    try {
      const data = await getAllRooms()
      setRooms(data)
    } catch (e) {
      console.error('채팅방 목록 로드 실패', e)
    }
  }

  const handleSelectRoom = (room) => {
    setSelectedRoom(room)
    setMessages([])
  }

  const handleSend = () => {
    if (!input.trim() || !selectedRoom || !clientRef.current?.connected) return

    const dto = {
      roomId: selectedRoom.roomId,
      senderRole: 'MANAGER',
      content: input.trim(),
    }

    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(dto),
    })
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCloseRoom = () => {
    showAlert('이 문의를 종료하시겠습니까?', async () => {
      await closeRoom(selectedRoom.roomId)
      setSelectedRoom(null)
      setMessages([])
      loadRooms()
    })
  }

  const formatTime = (createdAt) => {
    if (!createdAt) return ''
    return String(createdAt).slice(11, 16)
  }

  return (
    <div className={styles.container}>

      {/* 왼쪽 채팅방 목록 */}
      <div className={styles.roomList}>
        <div className={styles.roomListHeader}>
          <h2>1:1 문의</h2>
          <span>총 {rooms.length}개의 문의</span>
        </div>

        <div className={styles.roomItems}>
          {rooms.length === 0 ? (
            <div className={styles.emptyRooms}>문의 내역이 없습니다</div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.roomId}
                className={`${styles.roomItem} ${selectedRoom?.roomId === room.roomId ? styles.active : ''}`}
                onClick={() => handleSelectRoom(room)}
              >
                <div className={styles.roomItemTop}>
                  <span className={styles.memberName}>{room.memberName}</span>
                  <span className={`${styles.statusBadge} ${room.status === 'OPEN' ? styles.statusOpen : styles.statusClosed}`}>
                    {room.status === 'OPEN' ? '진행중' : '종료'}
                  </span>
                </div>
                <div className={styles.lastMessage}>
                  {room.lastMessage ?? '메시지 없음'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 오른쪽 채팅 창 */}
      <div className={styles.chatArea}>
        {!selectedRoom ? (
          <div className={styles.emptyChat}>
            <MdChatBubbleOutline size={48} />
            <p>왼쪽에서 문의를 선택해주세요</p>
          </div>
        ) : (
          <>
            {/* 헤더 */}
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderLeft}>
                {connected && <div className={styles.connectedDot} />}
                <h3>{selectedRoom.memberName} 님의 문의</h3>
              </div>
              {selectedRoom.status === 'OPEN' && (
                <button className={styles.closeBtn} onClick={handleCloseRoom}>
                  문의 종료
                </button>
              )}
            </div>

            {/* 메시지 목록 */}
            <div className={styles.messageList}>
              {messages.map((msg, i) => {
                const isMine = msg.senderRole === 'MANAGER'
                return (
                  <div key={msg.messageId ?? i} className={`${styles.messageRow} ${isMine ? styles.mine : styles.theirs}`}>
                    {!isMine && (
                      <div className={styles.avatar}>유저</div>
                    )}
                    <div className={`${styles.bubble} ${isMine ? styles.mine : styles.theirs}`}>
                      {msg.content}
                      <span className={`${styles.messageTime} ${!isMine ? styles.dark : ''}`}>
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={messageEndRef} />
            </div>

            {/* 입력창 */}
            {selectedRoom.status === 'OPEN' && (
              <div className={styles.inputArea}>
                <textarea
                  className={styles.input}
                  rows={1}
                  placeholder="메시지를 입력하세요... (Enter로 전송)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className={styles.sendBtn}
                  onClick={handleSend}
                  disabled={!input.trim() || !connected}
                >
                  <MdSend />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ChatManage