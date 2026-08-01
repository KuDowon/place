import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Archive,
  BellRing,
  Camera,
  Check,
  ChevronLeft,
  Clock3,
  Home,
  Image,
  MapPin,
  Mic,
  Plus,
  Search,
  ShieldAlert,
  UserRound,
  UsersRound,
  Video,
  X,
} from "lucide-react";

// TypeScript에서 window.naver 객체를 인식하도록 선언
declare global {
  interface Window {
    naver: any;
  }
}

type Tab = "home" | "family" | "archive" | "my";

// Memo 타입 정의 (images, coverImage 필드 포함)
type Memo = {
  id: number;
  place: string;
  content: string;
  author: string;
  emoji: string;
  shared: boolean;
  radius: number;
  time: string;
  done?: boolean;
  seen?: boolean;
  lat: number;
  lng: number;
  images?: string[];
  coverImage?: string;
};

// 네이버 장소 검색 타입 및 목 데이터
type NaverPlace = { title: string; category: string; address: string; roadAddress: string };

const MOCK_NAVER_DB: NaverPlace[] = [
  { title: "이마트 흑석점", category: "대형마트", address: "서울특별시 동작구 흑석동 97", roadAddress: "서울특별시 동작구 흑석로 97" },
  { title: "중앙약국", category: "약국", address: "서울특별시 동작구 흑석동 102", roadAddress: "서울특별시 동작구 흑석로 102" },
  { title: "중앙대학교 정문", category: "대학교", address: "서울특별시 동작구 흑석동 84", roadAddress: "서울특별시 동작구 흑석로 84" },
  { title: "흑석한강공원", category: "공원", address: "서울특별시 동작구 흑석동 1", roadAddress: "서울특별시 동작구 흑석로 1" },
  { title: "이마트24 흑석점", category: "편의점", address: "서울특별시 동작구 흑석동 201", roadAddress: "서울특별시 동작구 흑석로 201" },
];

function useNaverPlaceSearch(query: string): { places: NaverPlace[]; loading: boolean } {
  const [places, setPlaces] = useState<NaverPlace[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setPlaces([]); return; }
    setLoading(true);
    const timer = window.setTimeout(() => {
      const q = query.trim();
      setPlaces(MOCK_NAVER_DB.filter((p) => p.title.includes(q) || p.category.includes(q)));
      setLoading(false);
    }, 320);
    return () => window.clearTimeout(timer);
  }, [query]);

  return { places, loading };
}

// 흑석동 근처 실제 위경도가 적용된 데이터
const initialMemos: Memo[] = [
  { id: 1, place: "이마트 흑석점", content: "우유, 계란, 휴지 사오기", author: "엄마", emoji: "🛒", shared: true, radius: 100, time: "오늘 오후 7:00까지", lat: 37.5082, lng: 126.9635 },
  { id: 2, place: "중앙약국", content: "할머니 약 받아오기", author: "아빠", emoji: "💊", shared: true, radius: 300, time: "내일 오전 11:00까지", lat: 37.5071, lng: 126.9585 },
  { id: 3, place: "중앙대학교 정문", content: "학생지원팀에서 증명서 출력하기", author: "나", emoji: "✅", shared: false, radius: 100, time: "23시간 59분 남음", lat: 37.5051, lng: 126.9571 },
];

function Avatar({ name }: { name: string }) {
  const colors: Record<string, string> = { 엄마: "bg-rose-100 text-rose-500", 아빠: "bg-sky-100 text-sky-600", 나: "bg-violet-100 text-primary" };
  return <div className={`flex size-10 items-center justify-center rounded-2xl text-sm font-bold ${colors[name] ?? "bg-violet-100 text-primary"}`}>{name === "나" ? "유" : name.slice(0, 1)}</div>;
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [memos, setMemos] = useState<Memo[]>(initialMemos);
  const [selected, setSelected] = useState<Memo | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [arrivalOpen, setArrivalOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [place, setPlace] = useState("");
  const [content, setContent] = useState("");
  const [shared, setShared] = useState(false);
  const [radius, setRadius] = useState(100);
  const [doneBurst, setDoneBurst] = useState(false);
  const [myMemosOpen, setMyMemosOpen] = useState(false);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const updateMemo = (id: number, patch: Partial<Memo>) => {
    setMemos((items) => items.map((memo) => (memo.id === id ? { ...memo, ...patch } : memo)));
    setSelected((memo) => (memo?.id === id ? { ...memo, ...patch } : memo));
  };

  const saveMemo = (images: string[], coverImage: string) => {
    if (!place.trim() || (!content.trim() && images.length === 0)) return;
    
    // 새 메모 기본 좌표 (중앙대 정문 인근 약간의 랜덤 오프셋 적용)
    const targetLat = 37.5051 + (Math.random() - 0.5) * 0.002;
    const targetLng = 126.9571 + (Math.random() - 0.5) * 0.002;

    const memo: Memo = { 
      id: Date.now(), 
      place, 
      content, 
      author: "나", 
      emoji: "📍", 
      shared, 
      radius, 
      time: "방금 저장됨", 
      lat: targetLat, 
      lng: targetLng, 
      images, 
      coverImage: coverImage || undefined 
    };
    
    setMemos((items) => [memo, ...items]);
    setComposerOpen(false); 
    setPlace(""); 
    setContent(""); 
    setToast("이 장소에 메모를 붙였어요");

    // 지도가 로드되어 있다면 저장된 위치로 카메라 이동
    if (mapInstanceRef.current && window.naver && window.naver.maps) {
      const targetLatLng = new window.naver.maps.LatLng(targetLat, targetLng);
      mapInstanceRef.current.panTo(targetLatLng);
    }
  };

  const complete = (memo: Memo) => {
    updateMemo(memo.id, { done: true, seen: true });
    setDoneBurst(true);
    window.setTimeout(() => setDoneBurst(false), 1200);
  };

  const familyMemos = memos.filter((memo) => memo.shared);

  return (
    <main className="h-full w-full overflow-hidden bg-background" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <section className="relative h-full w-full overflow-hidden bg-background">
        <AnimatePresence mode="wait">
          {tab === "home" && <HomeScreen key="home" memos={memos} selected={selected} onSelect={setSelected} onCompose={() => setComposerOpen(true)} mapInstanceRef={mapInstanceRef} />}
          {tab === "family" && <FamilyScreen key="family" memos={familyMemos} setTab={setTab} onSelect={(memo) => { setSelected(memo); setTab("home"); }} />}
          {tab === "archive" && <ArchiveScreen key="archive" memos={memos.filter((memo) => memo.done)} setTab={setTab} />}
          {tab === "my" && <MyScreen key="my" memos={memos} setTab={setTab} myMemosOpen={myMemosOpen} setMyMemosOpen={setMyMemosOpen} onSelect={setSelected} />}
        </AnimatePresence>

        {tab === "home" && !selected && <button onClick={() => setArrivalOpen(true)} className="absolute right-5 top-[124px] z-20 flex size-12 items-center justify-center rounded-2xl border border-border bg-white text-primary shadow-[0_10px_30px_rgba(30,40,70,0.16)]" aria-label="도착 알림 미리보기"><BellRing size={20} /></button>}
        {tab === "home" && <BottomNav tab={tab} setTab={setTab} />}

        <AnimatePresence>{selected && <MemoDetail memo={selected} onClose={() => setSelected(null)} onComplete={() => complete(selected)} />}</AnimatePresence>
        <AnimatePresence>{composerOpen && <Composer place={place} content={content} shared={shared} radius={radius} setPlace={setPlace} setContent={setContent} setShared={setShared} setRadius={setRadius} onClose={() => setComposerOpen(false)} onSave={(imgs, cover) => saveMemo(imgs, cover)} />}</AnimatePresence>
        <AnimatePresence>{arrivalOpen && tab === "home" && <ArrivalCard memo={memos.find((memo) => memo.id === 1)!} onLater={() => setArrivalOpen(false)} onCheck={() => { updateMemo(1, { seen: true }); setArrivalOpen(false); setSelected({ ...memos.find((memo) => memo.id === 1)!, seen: true }); }} />}</AnimatePresence>
        <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }} className="absolute bottom-24 left-1/2 z-[80] -translate-x-1/2 whitespace-nowrap rounded-full bg-[#171a21] px-4 py-3 text-[13px] font-medium text-white shadow-xl">{toast}</motion.div>}</AnimatePresence>
        <AnimatePresence>{doneBurst && <motion.div initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0, scale: 1.7 }} className="pointer-events-none absolute inset-0 z-[90] flex items-center justify-center bg-white/30 backdrop-blur-[1px]"><div className="flex size-24 items-center justify-center rounded-full bg-primary text-white shadow-[0_18px_35px_rgba(103,87,255,0.35)]"><Check size={52} strokeWidth={3} /></div></motion.div>}</AnimatePresence>
      </section>
    </main>
  );
}

function HomeScreen({ memos, onSelect, onCompose, mapInstanceRef }: { memos: Memo[]; selected: Memo | null; onSelect: (m: Memo) => void; onCompose: () => void; mapInstanceRef: React.MutableRefObject<any> }) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [memoTrayOpen, setMemoTrayOpen] = useState(false);
  const [chosenPlace, setChosenPlace] = useState("");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const { places, loading } = useNaverPlaceSearch(query);
  const matchedMemos = query.trim() ? memos.filter((m) => m.place.includes(query) || m.content.includes(query)) : [];

  const nearby = memos.find((memo) => !memo.done) ?? memos[0];

  // 1. 네이버 지도 SDK 로드 여부 체크
  useEffect(() => {
    const checkNaverMap = () => {
      if (window.naver && window.naver.maps) {
        setIsMapLoaded(true);
      } else {
        setTimeout(checkNaverMap, 100);
      }
    };
    checkNaverMap();
  }, []);

  // 2. 지도 초기화, 커스텀 마커 생성 및 내 위치 연동
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      const mapOptions = {
        center: new window.naver.maps.LatLng(37.5051, 126.9571),
        zoom: 16,
        zoomControl: false,
      };
      mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, mapOptions);
    }

    const map = mapInstanceRef.current;

    // 내 위치 마커 생성 (최초 1회)
    if (navigator.geolocation && !map._myLocationMarker) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const myLatLng = new window.naver.maps.LatLng(lat, lng);

          map._myLocationMarker = new window.naver.maps.Marker({
            position: myLatLng,
            map: map,
            icon: {
              content: `
                <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">
                  <span style="position: absolute; width: 48px; height: 48px; border-radius: 50%; border: 1px solid rgba(103,87,255,0.3); background-color: rgba(103,87,255,0.15); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
                  <span style="width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; background-color: #6757ff; box-shadow: 0 4px 6px rgba(0,0,0,0.15);"></span>
                </div>
              `,
              anchor: new window.naver.maps.Point(24, 24),
            },
          });
        },
        (error) => {
          console.warn("위치 권한을 불러올 수 없습니다:", error);
        }
      );
    }

    // 커스텀 이모지 및 커버이미지 마커 생성
    const markers = memos.map((memo) => {
      const bgClass = memo.done ? "bg-[#e8eaef] grayscale" : memo.shared ? "bg-white" : "bg-[#ece9ff]";
      const innerContent = memo.coverImage
        ? `<img src="${memo.coverImage}" class="size-full object-cover rounded-2xl" />`
        : memo.done ? "✓" : memo.emoji;
      
      const iconHtml = `
        <div style="transform: translate(-50%, -100%); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translate(-50%, -100%) scale(1.1)'" onmouseout="this.style.transform='translate(-50%, -100%) scale(1.0)'">
          <div class="flex size-10 items-center justify-center overflow-hidden rounded-2xl border-2 border-white text-[18px] shadow-[0_8px_18px_rgba(45,39,94,.25)] ${bgClass}">
            ${innerContent}
          </div>
          <span class="mx-auto block h-2 w-2 -translate-y-1 rotate-45 bg-white shadow-sm"></span>
        </div>
      `;

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(memo.lat, memo.lng),
        map: map,
        icon: {
          content: iconHtml,
          anchor: new window.naver.maps.Point(0, 0),
        },
      });

      window.naver.maps.Event.addListener(marker, "click", () => {
        onSelect(memo);
      });

      return marker;
    });

    return () => {
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [isMapLoaded, memos]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-full overflow-hidden bg-[#f8f9fa]">
      {/* 네이버 지도 렌더링 영역 */}
      <div id="map" ref={mapRef} className="h-full w-full" />

      {/* 지도 로딩 레이어 */}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-sm text-gray-500">
          지도를 불러오는 중입니다...
        </div>
      )}

      {/* 상단 검색바 */}
      <div className="absolute left-4 right-4 top-[52px] z-20">
        <div className="flex h-12 items-center gap-2 rounded-[17px] border border-[#e7eaf1] bg-white px-4 shadow-[0_10px_30px_rgba(30,40,70,.16)]">
          <Search size={18} className="text-muted-foreground" />
          <input
            value={query}
            onFocus={() => setSearchOpen(true)}
            onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }}
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#757575]"
            placeholder="장소 검색"
          />
          <button onClick={() => { setQuery(""); setSearchOpen(false); }} className={query || searchOpen ? "text-muted-foreground" : "hidden"}>
            <X size={16} />
          </button>
        </div>
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-2 max-h-[60vh] overflow-y-auto rounded-[18px] border border-[#e7eaf1] bg-white shadow-[0_12px_30px_rgba(30,40,70,.14)]">
              {/* 장소 검색 결과 섹션 */}
              <div>
                <p className="px-4 pb-1.5 pt-3 text-[13px] font-bold text-foreground">장소 검색 결과</p>
                {loading && <p className="px-4 py-3 text-[12px] text-muted-foreground">검색 중...</p>}
                {!loading && places.length === 0 && query.trim() && <p className="px-4 py-3 text-[12px] text-muted-foreground">검색 결과가 없어요</p>}
                {!loading && !query.trim() && <p className="px-4 py-3 text-[12px] text-muted-foreground">장소 이름을 입력하면 검색 결과가 표시됩니다</p>}
                {places.map((place) => (
                  <button key={place.title} onClick={() => { setChosenPlace(place.title); setQuery(place.title); setSearchOpen(false); }} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-[#fafbfe]">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#eeecff] text-primary"><MapPin size={15} /></span>
                    <span className="min-w-0">
                      <b className="block truncate text-[13px] font-bold">{place.title}</b>
                      <span className="mt-0.5 block text-[11px] text-primary">{place.category}</span>
                      <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{place.roadAddress}</span>
                      <span className="block truncate text-[10px] text-[#b0b5c0]">지번 {place.address}</span>
                    </span>
                  </button>
                ))}
              </div>

              {/* 구분선 */}
              <div className="mx-4 border-t border-[#f0f1f5]" />

              {/* 메모 검색 결과 섹션 */}
              <div>
                <p className="px-4 pb-1.5 pt-3 text-[13px] font-bold text-foreground">메모 검색 결과</p>
                {matchedMemos.length === 0 && <p className="px-4 pb-3 text-[12px] text-muted-foreground">{query.trim() ? "일치하는 메모가 없어요" : "장소나 내용으로 메모를 검색할 수 있어요"}</p>}
                {matchedMemos.map((memo) => (
                  <button key={memo.id} onClick={() => { setSearchOpen(false); setQuery(""); onSelect(memo); }} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-[#fafbfe]">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#f3f4f8] text-base">{memo.emoji}</span>
                    <span className="min-w-0">
                      <b className="block truncate text-[13px] font-bold">{memo.place}</b>
                      <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">{memo.content}</span>
                      <span className="mt-0.5 block text-[10px] text-[#b0b5c0]">{memo.author} · 반경 {memo.radius}m</span>
                    </span>
                  </button>
                ))}
              </div>

              <p className="border-t border-[#f0f1f5] px-4 py-2 text-[10px] text-[#b0b5c0]">장소 검색은 네이버 지역 검색 API와 연결됩니다</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {chosenPlace && (
        <div className="absolute left-1/2 top-[126px] z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#171a21]/88 px-3 py-2 text-[11px] text-white">
          <MapPin size={13} className="text-[#bdb6ff]" />{chosenPlace} 선택됨
        </div>
      )}

      {/* 플로팅 + 버튼 */}
      <button onClick={onCompose} className="absolute bottom-[112px] right-[18px] z-10 flex size-[58px] items-center justify-center rounded-[29px] bg-primary text-white shadow-[0_14px_15px_rgba(103,87,255,.35)]">
        <Plus size={28} />
      </button>

      {/* 하단 메모 트레이 */}
      <div className="absolute bottom-[91px] left-4 right-4 z-10">
        <AnimatePresence mode="wait">
          {memoTrayOpen ? (
            <motion.button key="expanded" initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 28, opacity: 0 }} onClick={() => onSelect(nearby)} className="w-full rounded-[20px] border border-white/80 bg-white/95 p-3 text-left shadow-[0_10px_30px_rgba(30,40,70,.12)] backdrop-blur">
              <div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-bold text-primary">가까운 메모 · 120m</span><span onClick={(event) => { event.stopPropagation(); setMemoTrayOpen(false); }} className="rounded-lg bg-[#f3f4f8] px-2 py-1 text-[10px] text-muted-foreground">내리기</span></div>
              <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-[#ece9ff]">{nearby.emoji}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-foreground">{nearby.place}</p><p className="truncate text-[12px] text-muted-foreground">{nearby.author} · {nearby.content}</p></div><MapPin size={18} className="text-primary" /></div>
            </motion.button>
          ) : (
            <motion.button key="collapsed" initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 28, opacity: 0 }} onClick={() => setMemoTrayOpen(true)} className="mx-auto flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-4 py-3 text-[12px] font-bold text-foreground shadow-[0_10px_30px_rgba(30,40,70,.12)] backdrop-blur">
              <MapPin size={15} className="text-primary" />메모 보기 <span className="rounded-full bg-[#eeecff] px-1.5 py-0.5 text-[10px] text-primary">{memos.length}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function BottomNav({ tab, setTab }: { tab: Tab; setTab: (tab: Tab) => void }) {
  const items: { id: Tab; label: string; icon: typeof Home }[] = [{ id: "home", label: "홈", icon: Home }, { id: "family", label: "모임", icon: UsersRound }, { id: "archive", label: "보관함", icon: Archive }, { id: "my", label: "마이", icon: UserRound }];
  return <nav className="absolute bottom-0 z-40 flex h-[82px] w-full border-t border-[#edf0f5] bg-white px-5 pb-3 pt-2">{items.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`flex flex-1 flex-col items-center gap-1 text-[10px] font-medium ${tab === id ? "text-primary" : "text-[#9aa0ae]"}`}><span className={`flex size-8 items-center justify-center rounded-xl ${tab === id ? "bg-[#eeecff]" : ""}`}><Icon size={19} strokeWidth={tab === id ? 2.6 : 1.9} /></span>{label}</button>)}</nav>;
}

function MemoDetail({ memo, onClose, onComplete }: { memo: Memo; onClose: () => void; onComplete: () => void }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  return (
    <motion.section initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }} className="absolute inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-white px-5 pb-8 pt-3 shadow-[0_-18px_42px_rgba(31,39,74,.18)]">
      <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-[#d9dce5]" />
      <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
        <div><p className="text-[12px] font-semibold text-primary">장소 메모</p><h2 className="mt-0.5 text-[19px] font-bold">{memo.place}</h2></div>
        <button onClick={onClose} className="flex size-9 items-center justify-center rounded-full bg-[#f3f4f8]"><X size={18} /></button>
      </div>
      {memo.coverImage && (
        <button onClick={() => setLightbox(memo.coverImage!)} className="mb-4 block w-full overflow-hidden rounded-[16px]">
          <img src={memo.coverImage} className="h-[180px] w-full object-cover" />
        </button>
      )}
      <div className="rounded-[18px] bg-[#fafbfe] p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-[14px] bg-[#ece9ff] text-xl">{memo.emoji}</div>
          <div>
            <p className="text-[13px] text-muted-foreground">{memo.author === "나" ? "내가 남긴 메모" : `${memo.author}가 남긴 심부름`}</p>
            <p className="text-[12px] text-muted-foreground">도착 알림 · 반경 {memo.radius}m</p>
          </div>
        </div>
        {memo.content && (
          <p className={`text-[16px] leading-7 ${memo.done ? "text-[#a7acb7] line-through" : "font-medium text-foreground"}`}>{memo.content}</p>
        )}
      </div>
      {memo.images && memo.images.length > 1 && (
        <div className="mt-3">
          <p className="mb-2 text-[12px] font-bold text-muted-foreground">첨부 사진 {memo.images.length}장</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {memo.images.map((src, idx) => (
              <button key={idx} onClick={() => setLightbox(src)} className="relative shrink-0">
                <img src={src} className="h-[72px] w-[72px] rounded-[12px] object-cover" />
                {src === memo.coverImage && (
                  <span className="absolute bottom-1 left-1 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">대표</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      {memo.seen && !memo.done && <p className="mt-3 rounded-xl bg-[#f2f0ff] px-3 py-2 text-[12px] font-medium text-primary">✓ 도착 메모를 확인했어요</p>}
      {memo.done && <p className="mt-3 rounded-xl bg-[#f0f2f5] px-3 py-2 text-[12px] font-medium text-[#7b8290]">유연님이 심부름을 완료했어요</p>}
      <div className="mt-5 flex gap-2">
        {memo.shared && !memo.done && <button onClick={onComplete} className="flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-primary py-3.5 text-sm font-bold text-white"><Check size={17} /> 장보기 완료</button>}
        <button onClick={onClose} className={`${memo.shared && !memo.done ? "w-28" : "flex-1"} rounded-[14px] border border-border py-3.5 text-sm font-semibold text-[#5f6674]`}>닫기</button>
      </div>
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <img src={lightbox} className="max-h-[90vh] max-w-full rounded-xl object-contain px-4" />
            <button className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/20 text-white"><X size={18} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function Composer(props: { place: string; content: string; shared: boolean; radius: number; setPlace: (v: string) => void; setContent: (v: string) => void; setShared: (v: boolean) => void; setRadius: (v: number) => void; onClose: () => void; onSave: (images: string[], coverImage: string) => void }) {
  const [images, setImages] = useState<string[]>([]);
  const [coverIdx, setCoverIdx] = useState<number>(0);
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const galleryRef = React.useRef<HTMLInputElement>(null);
  const cameraRef = React.useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImages((prev) => {
            const next = [...prev, ev.target!.result as string];
            if (prev.length === 0) setCoverIdx(0);
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      setCoverIdx((c) => (c >= next.length ? Math.max(0, next.length - 1) : c));
      return next;
    });
  };

  const handleCameraClick = async () => {
    setPhotoPickerOpen(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraRef.current?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      cameraRef.current?.click();
    } catch {
      setCameraPermissionDenied(true);
    }
  };

  const canSave = props.place.trim() && (props.content.trim() || images.length > 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[70] bg-[#171a21]/25 backdrop-blur-[1px]">
      {/* 사진 선택 방식 팝업 */}
      <AnimatePresence>
        {photoPickerOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPhotoPickerOpen(false)} className="absolute inset-0 z-[80] flex items-end justify-center pb-6">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 320 }} onClick={(e) => e.stopPropagation()} className="mx-4 w-full max-w-sm overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_rgba(20,20,50,.22)]">
              <p className="border-b border-[#f0f1f5] px-5 py-4 text-center text-[13px] font-semibold text-muted-foreground">사진 추가 방법 선택</p>
              <button onClick={handleCameraClick} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[#fafbfe] active:bg-[#f3f4f8]">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-[#eeecff] text-primary"><Camera size={20} /></span>
                <div><p className="text-[15px] font-bold">사진 촬영</p><p className="text-[12px] text-muted-foreground">카메라로 바로 찍기</p></div>
              </button>
              <div className="mx-5 border-t border-[#f0f1f5]" />
              <button onClick={() => { setPhotoPickerOpen(false); galleryRef.current?.click(); }} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[#fafbfe] active:bg-[#f3f4f8]">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-[#eeecff] text-primary"><Image size={20} /></span>
                <div><p className="text-[15px] font-bold">사진 첨부</p><p className="text-[12px] text-muted-foreground">갤러리에서 선택</p></div>
              </button>
              <div className="px-4 pb-4 pt-2">
                <button onClick={() => setPhotoPickerOpen(false)} className="w-full rounded-[14px] bg-[#f3f4f8] py-3 text-[14px] font-bold text-[#5f6674]">취소</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 카메라 권한 거부 팝업 */}
      <AnimatePresence>
        {cameraPermissionDenied && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[80] flex items-center justify-center bg-black/30 px-6">
            <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }} transition={{ type: "spring", damping: 24, stiffness: 340 }} className="w-full max-w-sm rounded-[22px] bg-white p-6 shadow-[0_20px_50px_rgba(20,20,50,.24)]">
              <div className="mb-4 flex flex-col items-center gap-3 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-500"><ShieldAlert size={28} /></span>
                <h3 className="text-[17px] font-bold">카메라 권한이 필요해요</h3>
                <p className="text-[13px] leading-5 text-muted-foreground">사진 촬영을 위해 카메라 접근 권한이 필요합니다. 브라우저 설정에서 이 사이트의 카메라 권한을 허용해 주세요.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setCameraPermissionDenied(false)} className="flex-1 rounded-[13px] border border-border py-3 text-[14px] font-semibold text-[#5f6674]">닫기</button>
                <button onClick={() => { setCameraPermissionDenied(false); galleryRef.current?.click(); }} className="flex-1 rounded-[13px] bg-primary py-3 text-[14px] font-bold text-white">갤러리로 대체</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 갤러리용 input */}
      <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
      {/* 카메라용 input */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
      <motion.section initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 29, stiffness: 300 }} className="absolute inset-x-0 bottom-0 flex max-h-[90vh] flex-col rounded-t-[28px] bg-white px-5 pb-8 pt-3">
        <div className="mx-auto mb-4 h-1.5 w-11 shrink-0 rounded-full bg-[#d9dce5]" />
        <div className="mb-5 flex shrink-0 items-center justify-between">
          <div><p className="text-[12px] font-semibold text-primary">새로운 장소 메모</p><h2 className="text-xl font-bold">어디에 붙일까요?</h2></div>
          <button onClick={props.onClose} className="flex size-9 items-center justify-center rounded-full bg-[#f3f4f8]"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            <label className="block text-[13px] font-bold">장소 이름
              <input value={props.place} onChange={(e) => props.setPlace(e.target.value)} placeholder="예: 이마트 흑석점" className="mt-1.5 h-12 w-full rounded-[13px] border border-border bg-[#fafbfe] px-3 text-sm font-normal outline-none focus:border-primary" />
            </label>
            <div>
              <p className="mb-1.5 text-[13px] font-bold">메모 내용 <span className="font-normal text-muted-foreground">(선택)</span></p>
              <div className="relative mt-1.5 rounded-[13px] border border-border bg-[#fafbfe] focus-within:border-primary">
                <textarea value={props.content} onChange={(e) => props.setContent(e.target.value)} placeholder="이 장소에서 기억할 일을 적어보세요" className="h-[110px] w-full resize-none rounded-[13px] bg-transparent p-3 pb-10 text-sm font-normal outline-none" />
                <div className="absolute bottom-2.5 left-3 flex items-center gap-3">
                  <button type="button" onClick={() => setPhotoPickerOpen(true)} className="text-[#c0c5d0] transition-colors hover:text-[#8a91a3]" aria-label="이미지 추가"><Image size={18} /></button>
                  <button type="button" className="text-[#c0c5d0] transition-colors hover:text-[#8a91a3]" aria-label="음성 녹음"><Mic size={18} /></button>
                  <button type="button" className="text-[#c0c5d0] transition-colors hover:text-[#8a91a3]" aria-label="동영상 추가"><Video size={18} /></button>
                </div>
              </div>
            </div>
            {images.length > 0 && (
              <div>
                <p className="mb-2 text-[13px] font-bold">첨부 사진 <span className="font-normal text-muted-foreground">· 사진을 탭하면 대표사진으로 설정</span></p>
                <div className="flex gap-2 overflow-x-auto pb-1 pr-1">
                  {images.map((src, idx) => (
                    <div key={idx} className="relative shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                        className="absolute -right-1.5 -top-1.5 z-10 flex size-5 items-center justify-center rounded-full bg-[#171a21] text-white shadow"
                      >
                        <X size={11} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => setCoverIdx(idx)}
                        className={`block h-[72px] w-[72px] overflow-hidden rounded-[12px] transition-all ${coverIdx === idx ? "ring-2 ring-primary ring-offset-1" : "opacity-75 hover:opacity-100"}`}
                        style={{ clipPath: "inset(0 12px 0 0 round 12px 4px 12px 12px)" }}
                        aria-label="대표사진으로 설정"
                      >
                        <img src={src} className="h-full w-full object-cover" />
                      </button>
                      {coverIdx === idx && (
                        <span className="absolute bottom-1.5 left-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-bold leading-none text-white shadow">대표</span>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPhotoPickerOpen(true)}
                    className="flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center gap-1 rounded-[12px] border-2 border-dashed border-[#d9dce5] bg-[#f7f8fb] text-[#b0b5c0] transition-colors hover:border-primary hover:text-primary"
                    aria-label="사진 추가"
                  >
                    <Plus size={20} strokeWidth={2} />
                    <span className="text-[10px] font-medium">추가</span>
                  </button>
                </div>
              </div>
            )}
            <div>
              <p className="mb-2 text-[13px] font-bold">공개 범위</p>
              <div className="grid grid-cols-2 rounded-[13px] bg-[#f3f4f8] p-1">
                <button onClick={() => props.setShared(false)} className={`rounded-[10px] py-2.5 text-[13px] font-bold ${!props.shared ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>나만 보기</button>
                <button onClick={() => props.setShared(true)} className={`rounded-[10px] py-2.5 text-[13px] font-bold ${props.shared ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>모임 공유</button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-[13px] font-bold">도착 알림 반경</p>
              <div className="flex gap-2">{[50, 100, 300].map((v) => <button key={v} onClick={() => props.setRadius(v)} className={`flex-1 rounded-xl border py-2 text-[12px] font-bold ${props.radius === v ? "border-primary bg-[#eeecff] text-primary" : "border-border text-muted-foreground"}`}>{v}m</button>)}</div>
            </div>
          </div>
        </div>
        <button disabled={!canSave} onClick={() => props.onSave(images, images[coverIdx] ?? "")} className="mt-4 w-full shrink-0 rounded-[15px] bg-primary py-3.5 text-sm font-bold text-white disabled:bg-[#c7c4ed]">메모 붙이기</button>
      </motion.section>
    </motion.div>
  );
}

function ArrivalCard({ memo, onLater, onCheck }: { memo: Memo; onLater: () => void; onCheck: () => void }) { return <motion.section initial={{ y: 160, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 160, opacity: 0 }} transition={{ type: "spring", damping: 23, stiffness: 320 }} className="absolute inset-x-4 bottom-[96px] z-[35] rounded-[22px] border border-white bg-white p-4 shadow-[0_18px_45px_rgba(39,39,74,.20)]"><div className="mb-3 flex items-start gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#eeecff] text-xl">🛒</div><div><p className="text-[16px] font-bold">마트에 도착했어요! 🛒</p><p className="mt-1 text-[12px] leading-5 text-muted-foreground">엄마가 남긴 심부름 — {memo.content}</p></div></div><div className="flex gap-2"><button onClick={onLater} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#f3f4f8] py-2.5 text-[12px] font-bold text-[#697080]"><X size={15} /> 나중에 보기</button><button onClick={onCheck} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-[12px] font-bold text-white"><Check size={15} /> 확인했어요</button></div></motion.section>; }

function FamilyScreen({ memos, onSelect, setTab }: { memos: Memo[]; onSelect: (m: Memo) => void; setTab: (tab: Tab) => void }) { return <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="h-full bg-[#f7f8fb] px-5 pt-[61px]"><div className="mb-6"><p className="text-[12px] font-bold text-primary">우리 모임의 장소 메모</p><h1 className="mt-1 text-[24px] font-bold">모임 심부름</h1></div><div className="space-y-3">{memos.map((memo) => <button onClick={() => onSelect(memo)} key={memo.id} className="w-full rounded-[20px] bg-white p-4 text-left shadow-[0_8px_25px_rgba(30,40,70,.06)]"><div className="flex gap-3"><Avatar name={memo.author} /><div className="min-w-0 flex-1"><div className="flex items-center justify-between"><p className="text-[14px] font-bold">{memo.author}</p><span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock3 size={11} />{memo.time}</span></div><p className="mt-0.5 flex items-center gap-1 text-[12px] text-primary"><MapPin size={12} />{memo.place}</p><p className={`mt-2 text-[14px] leading-5 ${memo.done ? "text-[#a6abb6] line-through" : "text-foreground"}`}>{memo.content}</p>{memo.done && <p className="mt-3 rounded-lg bg-[#f0f2f5] px-2.5 py-2 text-[11px] font-medium text-[#7b8290]">유연님이 심부름을 완료했어요</p>}</div></div></button>)}</div><BottomNav tab="family" setTab={setTab} /></motion.div>; }

function ArchiveScreen({ memos, setTab }: { memos: Memo[]; setTab: (tab: Tab) => void }) { return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full bg-[#f7f8fb] px-5 pt-[61px]"><p className="text-[12px] font-bold text-primary">기억하고 싶은 장소</p><h1 className="mt-1 text-[24px] font-bold">보관함</h1><div className="mt-7 rounded-[20px] bg-white p-5 text-center text-sm text-muted-foreground">{memos.length ? `${memos.length}개의 완료 메모가 있어요.` : "아직 보관한 메모가 없어요."}</div><BottomNav tab="archive" setTab={setTab} /></motion.div>; }

function MyScreen({ memos, setTab, myMemosOpen, setMyMemosOpen, onSelect }: { memos: Memo[]; setTab: (tab: Tab) => void; myMemosOpen: boolean; setMyMemosOpen: (value: boolean) => void; onSelect: (memo: Memo) => void }) { const ownMemos = memos.filter((memo) => memo.author === "나"); return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full bg-[#f7f8fb] px-5 pt-[61px]"><div className="flex items-center gap-3"><Avatar name="나" /><div><p className="text-lg font-bold">유연님</p><p className="text-[12px] text-muted-foreground">나의 장소 메모 {ownMemos.length}개</p></div></div>{myMemosOpen ? <div className="mt-7"><button onClick={() => setMyMemosOpen(false)} className="mb-3 flex items-center gap-1 text-[13px] font-bold text-primary"><ChevronLeft size={17} /> 설정으로</button><h2 className="mb-3 text-[19px] font-bold">내 메모 보기</h2><div className="space-y-2">{ownMemos.map((memo) => <button onClick={() => onSelect(memo)} key={memo.id} className="w-full rounded-[17px] bg-white p-4 text-left"><p className="flex items-center gap-1 text-[12px] text-primary"><MapPin size={13} />{memo.place}</p><p className="mt-1 text-[14px] font-medium">{memo.content}</p></button>)}{!ownMemos.length && <div className="rounded-[17px] bg-white p-4 text-center text-sm text-muted-foreground">아직 내가 남긴 메모가 없어요.</div>}</div></div> : <div className="mt-7 space-y-3"><button onClick={() => setMyMemosOpen(true)} className="w-full rounded-[18px] bg-white p-4 text-left text-sm font-semibold">내 메모 보기 <MapPin className="float-right text-primary" size={18} /></button><div className="rounded-[18px] bg-white p-4 text-sm font-semibold">알림 설정 <BellRing className="float-right text-primary" size={18} /></div><div className="rounded-[18px] bg-white p-4 text-sm font-semibold">가족 관리 <UsersRound className="float-right text-primary" size={18} /></div></div>}<BottomNav tab="my" setTab={setTab} /></motion.div>; }