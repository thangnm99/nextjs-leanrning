'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from '@/app/ui/invoice-voice.module.css';

interface Item {
  name: string;
  qty: string;
  dot: string;
}

const sampleItems: Item[] = [
  { name: 'Đỗ xanh hãng Hải Nam', qty: '1 kg', dot: 'dotGreen' },
  { name: 'Lạc đỏ tàu', qty: '1 bao · 25 kg', dot: 'dotAmber' },
  { name: 'Gạo ST25', qty: '2 bao · 50 kg', dot: 'dotCoral' },
  { name: 'Đường trắng RS', qty: '3 bao · 75 kg', dot: 'dotPurple' },
  { name: 'Muối hạt Bạc Liêu', qty: '2 bao · 50 kg', dot: 'dotBlue' },
  { name: 'Bột mì số 11', qty: '5 bao · 125 kg', dot: 'dotGreen' },
  { name: 'Dầu ăn Neptune', qty: '2 thùng', dot: 'dotAmber' },
  { name: 'Nước mắm Phú Quốc', qty: '1 thùng', dot: 'dotPink' },
  { name: 'Bột ngọt Ajinomoto', qty: '1 thùng', dot: 'dotCoral' },
  { name: 'Hạt tiêu Phú Quốc', qty: '2 kg', dot: 'dotTeal' },
  { name: 'Nếp cái hoa vàng', qty: '1 bao · 25 kg', dot: 'dotPurple' },
  { name: 'Đậu đen xanh lòng', qty: '3 kg', dot: 'dotGreen' },
  { name: 'Bột năng Tài Ký', qty: '2 bao · 50 kg', dot: 'dotBlue' },
  { name: 'Hành khô Sóc Trăng', qty: '5 kg', dot: 'dotAmber' },
  { name: 'Tỏi Lý Sơn', qty: '3 kg', dot: 'dotPink' },
];

const transcriptPhrases = [
  '"...đỗ xanh hãng Hải Nam, một ký..."',
  '"...lạc đỏ tàu, một bao hai lăm ký..."',
  '"...gạo ST25, hai bao năm mươi ký..."',
  '"...đường trắng RS, ba bao bảy lăm ký..."',
  '"...muối hạt Bạc Liêu, hai bao..."',
  '"...bột mì số 11, năm bao..."',
  '"...dầu ăn Neptune, hai thùng..."',
  '"...nước mắm Phú Quốc, một thùng..."',
  '"...bột ngọt Ajinomoto, một thùng..."',
  '"...hạt tiêu Phú Quốc, hai ký..."',
  '"...nếp cái hoa vàng, một bao..."',
  '"...đậu đen xanh lòng, ba ký..."',
  '"...bột năng Tài Ký, hai bao..."',
  '"...hành khô Sóc Trăng, năm ký..."',
  '"...tỏi Lý Sơn, ba ký..."',
];

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0');
}

export default function Page() {
  const [isRecording, setIsRecording] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('"..."');
  const [waveBars, setWaveBars] = useState<number[]>(Array(10).fill(6));
  const [waveOpacities, setWaveOpacities] = useState<number[]>(Array(10).fill(1));

  const sampleIndexRef = useRef(0);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const itemTimerRef = useRef<NodeJS.Timeout | null>(null);
  const waveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const itemListRef = useRef<HTMLDivElement>(null);
  const isRecordingRef = useRef(false);

  // Auto-scroll to bottom when items change
  useEffect(() => {
    if (itemListRef.current) {
      itemListRef.current.scrollTop = itemListRef.current.scrollHeight;
    }
  }, [items]);

  const addNextItem = useCallback(() => {
    const idx = sampleIndexRef.current;
    if (idx >= sampleItems.length) return false;
    setItems(prev => [...prev, { ...sampleItems[idx] }]);
    setTranscript(transcriptPhrases[idx]);
    sampleIndexRef.current = idx + 1;
    return true;
  }, []);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (itemTimerRef.current) clearInterval(itemTimerRef.current);
    if (waveTimerRef.current) clearInterval(waveTimerRef.current);
  }, []);

  const startRecording = useCallback(() => {
    isRecordingRef.current = true;
    setIsRecording(true);
    setSeconds(0);

    recordTimerRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    waveTimerRef.current = setInterval(() => {
      setWaveBars(Array(10).fill(0).map(() => Math.floor(Math.random() * 20) + 4));
      setWaveOpacities(Array(10).fill(0).map(() => 0.4 + Math.random() * 0.6));
    }, 120);

    addNextItem();
    itemTimerRef.current = setInterval(() => {
      if (sampleIndexRef.current >= sampleItems.length) {
        stopRecording();
        return;
      }
      addNextItem();
    }, 1800);
  }, [addNextItem, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (itemTimerRef.current) clearInterval(itemTimerRef.current);
      if (waveTimerRef.current) clearInterval(waveTimerRef.current);
    };
  }, []);

  const handleRecord = () => {
    if (!isRecording) startRecording();
    else stopRecording();
  };

  const handleClear = () => {
    setItems([]);
    sampleIndexRef.current = 0;
    setSeconds(0);
  };

  const handleSave = () => {
    const text = items.map((item, i) => `${i + 1}. ${item.name} — ${item.qty}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'don-hang.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className={styles.app}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Voice memo</h1>
        <div className={`${styles.badge} ${isRecording ? styles.badgeActive : ''}`}>
          <div className={styles.badgeDot}></div>
          <span>REC {formatTime(seconds)}</span>
        </div>
      </div>

      {/* Sub header */}
      <div className={styles.subHeader}>
        <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
        <span>{items.length > 8 ? 'scroll to see all' : ''}</span>
      </div>

      <div className={styles.divider}></div>

      {/* Item list */}
      <div className={styles.itemList} ref={itemListRef}>
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0014 0" />
              <line x1="12" y1="17" x2="12" y2="22" />
            </svg>
            <p>Bấm nút micro bên dưới<br />để bắt đầu ghi âm</p>
          </div>
        ) : (
          items.map((item, i) => {
            const isLast = i === items.length - 1 && isRecording;
            return (
              <div
                key={i}
                className={`${styles.itemRow} ${isLast ? styles.itemRowProcessing : ''}`}
              >
                <span className={styles.itemNum}>{i + 1}</span>
                <div className={`${styles.itemDot} ${styles[item.dot] || ''}`}></div>
                <span className={styles.itemName}>{item.name}</span>
                <span className={`${styles.itemQty} ${isLast ? styles.itemQtyPending : ''}`}>
                  {isLast ? 'đang nhận...' : item.qty}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        {/* Transcript bar */}
        <div className={`${styles.transcriptBar} ${isRecording ? styles.transcriptBarActive : ''}`}>
          <div className={styles.waveform}>
            {waveBars.map((h, i) => (
              <div
                key={i}
                className={styles.waveBar}
                style={{ height: `${h}px`, opacity: waveOpacities[i] }}
              />
            ))}
          </div>
          <span className={styles.transcriptText}>{transcript}</span>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <button
            className={styles.btnSecondary}
            disabled={items.length === 0 || isRecording}
            onClick={handleSave}
            title="Lưu đơn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </button>

          <button
            className={`${styles.btnRecord} ${isRecording ? styles.btnRecordRecording : ''}`}
            onClick={handleRecord}
          >
            {!isRecording ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0014 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="17" x2="12" y2="22" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                <rect x="5" y="5" width="14" height="14" rx="2" />
              </svg>
            )}
          </button>

          <button
            className={styles.btnSecondary}
            disabled={items.length === 0 || isRecording}
            onClick={handleClear}
            title="Xóa tất cả"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>

        <div className={styles.homeIndicator}>
          <div className={styles.homeIndicatorBar}></div>
        </div>
      </div>
    </div>
  );
}
