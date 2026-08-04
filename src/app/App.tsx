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
  LocateFixed,
  MapPin,
  Mic,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  UserRound,
  UsersRound,
  Video,
  X,
} from "lucide-react";

declare global {
  interface Window {
    naver: any;
  }
}

type Tab = "home" | "family" | "archive" | "my";
type FamilyMember = "엄마" | "아빠" | "김뽀꾸";

type Memo = {
  id: number;
  place: string;
  content: string;
  author: string;
  emoji: string;
  shared: boolean;
  sharedWith?: FamilyMember[];
  radius: number;
  time: string;
  done?: boolean;
  seen?: boolean;
  lat: number;
  lng: number;
  images?: string[];
  coverImage?: string;
  address?: string;
  createdAt: string;
  expiresAt: string;
  archived: boolean;
  archivedAt?: string;
  completedAt?: string;
  completedBy?: string;
};

type NaverPlace = {
  title: string;
  category: string;
  address: string;
  roadAddress: string;
  lat?: number;
  lng?: number;
  distance?: number;
};

// 고정 테스트 좌표 (위도: 37.504452, 경도: 126.956481)
const TEST_LAT = 37.504452;
const TEST_LNG = 126.956481;
const HOUR = 60 * 60 * 1000;
const MEMO_STORAGE_KEY = "hwiririk-memos-v3";

const MOCK_PLACES: NaverPlace[] = [
  { title: "이마트 흑석점", category: "대형마트", address: "서울특별시 동작구 흑석동 97", roadAddress: "서울특별시 동작구 흑석로 97", lat: 37.5082, lng: 126.9635 },
  { title: "중앙약국", category: "약국", address: "서울특별시 동작구 흑석동 102", roadAddress: "서울특별시 동작구 흑석로 102", lat: 37.5071, lng: 126.9585 },
  { title: "올리브영 중앙대점", category: "헬스앤뷰티", address: "서울특별시 동작구 흑석동 195-17", roadAddress: "서울특별시 동작구 흑석로 81", lat: 37.5062, lng: 126.9573 },
  { title: "중앙대학교 정문", category: "대학교", address: "서울특별시 동작구 흑석동 84", roadAddress: "서울특별시 동작구 흑석로 84", lat: 37.5051, lng: 126.9571 },
  { title: "흑석한강공원", category: "공원", address: "서울특별시 동작구 흑석동 1", roadAddress: "서울특별시 동작구 흑석로 1", lat: 37.5095, lng: 126.9610 },
  { title: "이마트24 흑석점", category: "편의점", address: "서울특별시 동작구 흑석동 201", roadAddress: "서울특별시 동작구 흑석로 201", lat: 37.5060, lng: 126.9590 },
  { title: "다이소 흑석역점", category: "생활용품점", address: "서울특별시 동작구 흑석동 100-16", roadAddress: "서울특별시 동작구 서달로 161-1", lat: 37.5076, lng: 126.9602 },
  { title: "다이소 상도역점", category: "생활용품점", address: "서울특별시 동작구 상도1동", roadAddress: "서울특별시 동작구 상도로 277", lat: 37.5028, lng: 126.9475 },
];

function distanceMeters(fromLat: number, fromLng: number, toLat?: number, toLng?: number) {
  if (toLat == null || toLng == null) return Number.POSITIVE_INFINITY;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(distance?: number) {
  if (distance == null || !Number.isFinite(distance)) return "거리 확인 전";
  if (distance < 1000) return `${Math.max(1, Math.round(distance))}m`;
  return `${(distance / 1000).toFixed(1)}km`;
}

function getEmojiByCategory(category?: string, content?: string, place?: string): string {
  if (category) {
    if (category.includes("마트") || category.includes("편의점") || category.includes("생활용품")) return "🛒";
    if (category.includes("약국") || category.includes("병원")) return "💊";
    if (category.includes("학교") || category.includes("대학교")) return "🎓";
    if (category.includes("공원") || category.includes("산")) return "🌳";
    if (category.includes("식당") || category.includes("음식점") || category.includes("카페")) return "☕";
  }
  return "📍";
}

function useNaverPlaceSearch(query: string): { places: NaverPlace[]; loading: boolean } {
  const [places, setPlaces] = useState<NaverPlace[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setPlaces([]);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(() => {
      const filtered = MOCK_PLACES.filter((p) => p.title.includes(q) || p.category.includes(q) || p.address.includes(q) || p.roadAddress.includes(q));
      setPlaces(filtered);
      setLoading(false);
    }, 150);

    return () => window.clearTimeout(timer);
  }, [query]);

  return { places, loading };
}

function initialMemos(): Memo[] {
  const now = Date.now();
  return [
    { id: 1, place: "이마트 흑석점", content: "우유, 계란, 휴지 사오기", author: "엄마", emoji: "🛒", shared: true, radius: 100, time: "22시간 남음", lat: 37.5082, lng: 126.9635, address: "서울특별시 동작구 흑석로 97", createdAt: new Date(now - 2 * HOUR).toISOString(), expiresAt: new Date(now + 22 * HOUR).toISOString(), archived: false },
    { id: 2, place: "중앙약국", content: "할머니 약 받아오기", author: "아빠", emoji: "💊", shared: true, radius: 300, time: "19시간 남음", lat: 37.5071, lng: 126.9585, address: "서울특별시 동작구 흑석로 102", createdAt: new Date(now - 5 * HOUR).toISOString(), expiresAt: new Date(now + 19 * HOUR).toISOString(), archived: false },
    { id: 3, place: "중앙대학교 정문", content: "학생지원팀에서 증명서 출력하기", author: "나", emoji: "🎓", shared: false, radius: 100, time: "23시간 남음", lat: 37.5051, lng: 126.9571, address: "서울특별시 동작구 흑석로 84", createdAt: new Date(now - HOUR).toISOString(), expiresAt: new Date(now + 23 * HOUR).toISOString(), archived: true, archivedAt: new Date(now - 30 * 60 * 1000).toISOString() },
  ];
}

function normalizeMemo(memo: Partial<Memo> & Pick<Memo, "id" | "place" | "content" | "author" | "emoji" | "shared" | "radius" | "time" | "lat" | "lng">): Memo {
  const createdAt = memo.createdAt ?? new Date().toISOString();
  return {
    ...memo,
    images: memo.images ?? [],
    sharedWith: memo.sharedWith ?? [],
    createdAt,
    expiresAt: memo.expiresAt ?? new Date(new Date(createdAt).getTime() + 24 * HOUR).toISOString(),
    archived: memo.archived ?? false,
    completedAt: memo.completedAt ?? (memo.done ? createdAt : undefined),
    completedBy: memo.completedBy ?? (memo.done ? "김뽀꾸" : undefined),
  };
}

function loadMemos(): Memo[] {
  try {
    const saved = window.localStorage.getItem(MEMO_STORAGE_KEY);
    if (!saved) return initialMemos();
    const parsed = JSON.parse(saved) as Memo[];
    if (!Array.isArray(parsed)) return initialMemos();
    const normalized = parsed.map(normalizeMemo).filter((memo) => memo.archived || new Date(memo.expiresAt).getTime() > Date.now());
    const savedIds = new Set(normalized.map((memo) => memo.id));
    const restoredDemoMemos = initialMemos().filter((memo) => !memo.archived && !savedIds.has(memo.id));
    return [...restoredDemoMemos, ...normalized];
  } catch {
    return initialMemos();
  }
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatRemaining(expiresAt: string) {
  const minutes = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 60000));
  if (minutes >= 60) return `${Math.floor(minutes / 60)}시간 ${minutes % 60}분 남음`;
  return `${minutes}분 남음`;
}

function Avatar({ name }: { name: string }) {
  const colors: Record<string, string> = { 엄마: "bg-rose-100 text-rose-500", 아빠: "bg-sky-100 text-sky-600", 나: "bg-teal-100 text-primary" };
  return <div className={`flex size-10 items-center justify-center rounded-2xl text-sm font-bold ${colors[name] ?? "bg-teal-100 text-primary"}`}>{name === "나" ? "뽀" : name.slice(0, 1)}</div>;
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [memos, setMemos] = useState<Memo[]>(loadMemos);
  const [now, setNow] = useState(Date.now());
  const [selected, setSelected] = useState<Memo | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [arrivalOpen, setArrivalOpen] = useState(false);
  const [arrivalTarget, setArrivalTarget] = useState<Memo | null>(null);
  const [toast, setToast] = useState("");
  const [place, setPlace] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<NaverPlace | null>(null);
  const [content, setContent] = useState("");
  const [shared, setShared] = useState(false);
  const [radius, setRadius] = useState(100);
  const [doneBurst, setDoneBurst] = useState(false);
  const [myMemosOpen, setMyMemosOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Memo | null>(null);
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 개발자 테스트용 상태 (5회 연속 클릭 트리거)
  const [isDebugLocation, setIsDebugLocation] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<number | null>(null);
  const notifiedMemoIdsRef = useRef<Set<number>>(new Set());

  const mapInstanceRef = useRef<any>(null);

  // 사용자 실제 위치 추적
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => undefined,
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    try {
      window.localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(memos));
    } catch {
      // 사진 데이터 용량 초과 대응
    }
  }, [memos]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setMemos((items) => items.filter((memo) => memo.archived || new Date(memo.expiresAt).getTime() > now));
  }, [now]);

  useEffect(() => {
    if (selected && !memos.some((memo) => memo.id === selected.id)) setSelected(null);
  }, [memos, selected]);

  // 화면 연속 5회 타격 시 개발자 테스트 모드 토글
  const handleSecretTap = () => {
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      setIsDebugLocation(true);
      setToast("🧪 개발자 모드: 현위치가 테스트 좌표로 고정되었습니다 (37.504452, 126.956481)");

      if (mapInstanceRef.current && window.naver?.maps) {
        const testLatLng = new window.naver.maps.LatLng(TEST_LAT, TEST_LNG);
        mapInstanceRef.current.panTo(testLatLng);

        if (mapInstanceRef.current._myLocationMarker) {
          mapInstanceRef.current._myLocationMarker.setPosition(testLatLng);
        }
      }
    } else {
      clickTimerRef.current = window.setTimeout(() => {
        clickCountRef.current = 0;
      }, 1500);
    }
  };

  const updateMemo = (id: number, patch: Partial<Memo>) => {
    setMemos((items) => items.map((memo) => (memo.id === id ? { ...memo, ...patch } : memo)));
    setSelected((memo) => (memo?.id === id ? { ...memo, ...patch } : memo));
  };

  const openComposerWithCurrentLocation = () => {
    setPlace("");
    setSelectedPlace(null);
    setComposerOpen(true);
  };

  const openComposerWithPlace = (targetPlace: NaverPlace) => {
    setPlace(targetPlace.title);
    setSelectedPlace(targetPlace);
    setComposerOpen(true);
  };

  // 장소에 메모 저장하기
  const saveMemo = (images: string[], coverImage: string, sharedWith: FamilyMember[]) => {
    if (!place.trim() || (!content.trim() && images.length === 0)) return;

    let targetLat = TEST_LAT;
    let targetLng = TEST_LNG;

    if (selectedPlace?.lat && selectedPlace?.lng) {
      targetLat = selectedPlace.lat;
      targetLng = selectedPlace.lng;
    } else if (isDebugLocation) {
      targetLat = TEST_LAT;
      targetLng = TEST_LNG;
    } else if (userLocation) {
      targetLat = userLocation.lat;
      targetLng = userLocation.lng;
    } else if (mapInstanceRef.current && window.naver?.maps) {
      const center = mapInstanceRef.current.getCenter();
      targetLat = center.lat();
      targetLng = center.lng();
    }

    // 카테고리 기반 이모지 지정 (실패 시 내용 첫 글자)
    const memoEmoji = getEmojiByCategory(selectedPlace?.category, content, place);
    const createdAt = new Date().toISOString();

    const memo: Memo = {
      id: Date.now(),
      place,
      content,
      author: "나",
      emoji: memoEmoji,
      shared,
      sharedWith: shared ? sharedWith : [],
      radius,
      time: "24시간 남음",
      lat: targetLat,
      lng: targetLng,
      images,
      coverImage: coverImage || undefined,
      address: selectedPlace?.roadAddress || selectedPlace?.address,
      createdAt,
      expiresAt: new Date(Date.now() + 24 * HOUR).toISOString(),
      archived: false,
    };

    setMemos((items) => [memo, ...items]);
    setComposerOpen(false);
    setPlace("");
    setSelectedPlace(null);
    setContent("");
    setShared(false);
    setToast("장소에 메모를 부착하고 핀을 꼽았어요!");

    if ("Notification" in window && window.Notification.permission === "default") {
      void window.Notification.requestPermission();
    }

    if (mapInstanceRef.current && window.naver?.maps) {
      mapInstanceRef.current.panTo(new window.naver.maps.LatLng(targetLat, targetLng));
    }
  };

  const complete = (memo: Memo) => {
    updateMemo(memo.id, { done: true, seen: true, completedAt: new Date().toISOString(), completedBy: "김뽀꾸" });
    setDoneBurst(true);
    window.setTimeout(() => setDoneBurst(false), 1200);
  };

  const archiveMemo = (memo: Memo) => {
    if (memo.archived) return;
    updateMemo(memo.id, { archived: true, archivedAt: new Date().toISOString() });
    setToast("보관함에 저장했어요");
  };

  const deleteMemo = (memo: Memo) => {
    if (memo.author !== "나") {
      setDeleteTarget(null);
      setToast("내가 작성한 메모만 삭제할 수 있어요");
      return;
    }
    setMemos((items) => items.filter((item) => item.id !== memo.id));
    setSelected((item) => (item?.id === memo.id ? null : item));
    setDeleteTarget(null);
    setToast("메모를 완전히 삭제했어요");
  };

  const activeMemos = memos.filter((memo) => new Date(memo.expiresAt).getTime() > now);
  const familyMemos = activeMemos.filter((memo) => memo.shared);
  const archivedMemos = memos.filter((memo) => memo.archived);
  const arrivalMemo = activeMemos.find((memo) => memo.id === 1);
  const shownArrivalMemo = arrivalTarget ?? arrivalMemo;

  // 위치 감지 및 푸시 알림 (파비콘 포함)
  useEffect(() => {
    if (!navigator.geolocation || activeMemos.length === 0) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const nearbyMemo = activeMemos.find((memo) => {
          if (memo.done || notifiedMemoIdsRef.current.has(memo.id)) return false;
          return distanceMeters(position.coords.latitude, position.coords.longitude, memo.lat, memo.lng) <= memo.radius;
        });

        if (!nearbyMemo) return;
        notifiedMemoIdsRef.current.add(nearbyMemo.id);
        setArrivalTarget(nearbyMemo);
        setArrivalOpen(true);

        if ("Notification" in window && window.Notification.permission === "granted") {
          try {
            new window.Notification(`휘리릭 ·${nearbyMemo.place} 근처에 도착했어요!`, {
              body: nearbyMemo.content || "이 장소에 남겨둔 메모를 확인해보세요.",
              icon: "/favicon.ico", // 파비콘 설정 반영
              tag: `place-memo-${nearbyMemo.id}`,
            });
          } catch {
            // 모바일 브라우저 예외 처리
          }
        }
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [activeMemos]);

  const handleTabChange = (nextTab: Tab) => {
    setTab(nextTab);
    if (nextTab === "home" && mapInstanceRef.current && window.naver?.maps) {
      setTimeout(() => {
        if (isDebugLocation) {
          mapInstanceRef.current.panTo(new window.naver.maps.LatLng(TEST_LAT, TEST_LNG));
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const myLatLng = new window.naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
              mapInstanceRef.current.panTo(myLatLng);
            },
            () => {
              mapInstanceRef.current.panTo(new window.naver.maps.LatLng(37.5051, 126.9571));
            }
          );
        } else {
          mapInstanceRef.current.panTo(new window.naver.maps.LatLng(37.5051, 126.9571));
        }
      }, 100);
    }
  };

  return (
    <main 
      onClick={handleSecretTap} 
      className="h-full w-full overflow-hidden bg-background select-none" 
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      <section className="relative h-full w-full overflow-hidden bg-background">
        <AnimatePresence mode="wait">
          {tab === "home" && (
            <HomeScreen 
              key="home" 
              memos={activeMemos} 
              selected={selected} 
              onSelect={setSelected} 
              onComposeCurrent={openComposerWithCurrentLocation}
              onComposePlace={openComposerWithPlace}
              mapInstanceRef={mapInstanceRef} 
              isDebugLocation={isDebugLocation} 
            />
          )}
          {tab === "family" && <FamilyScreen key="family" memos={familyMemos} setTab={handleTabChange} onSelect={(memo) => { setSelected(memo); handleTabChange("home"); }} />}
          {tab === "archive" && <ArchiveScreen key="archive" memos={archivedMemos} setTab={handleTabChange} onSelect={setSelected} onRequestDelete={setDeleteTarget} />}
          {tab === "my" && <MyScreen key="my" memos={activeMemos} setTab={handleTabChange} myMemosOpen={myMemosOpen} setMyMemosOpen={setMyMemosOpen} onSelect={setSelected} onRequestDelete={setDeleteTarget} />}
        </AnimatePresence>

        {tab === "home" && !selected && arrivalMemo && <button onClick={(e) => { e.stopPropagation(); setArrivalTarget(arrivalMemo); setArrivalOpen(true); if ("Notification" in window && window.Notification.permission === "default") void window.Notification.requestPermission(); }} className="absolute right-5 top-[92px] z-20 flex size-12 items-center justify-center rounded-2xl border border-border bg-white text-primary shadow-[0_10px_30px_rgba(30,40,70,0.16)]" aria-label="도착 알림 미리보기"><BellRing size={20} /></button>}
        {tab === "home" && <BottomNav tab={tab} setTab={handleTabChange} />}

        <AnimatePresence>{selected && <MemoDetail memo={selected} onClose={() => setSelected(null)} onComplete={() => complete(selected)} onArchive={() => archiveMemo(selected)} onRequestDelete={() => setDeleteTarget(selected)} />}</AnimatePresence>
        <AnimatePresence>{composerOpen && <Composer place={place} selectedPlace={selectedPlace} content={content} shared={shared} radius={radius} setPlace={setPlace} setSelectedPlace={setSelectedPlace} setContent={setContent} setShared={setShared} setRadius={setRadius} onClose={() => { setComposerOpen(false); setShared(false); }} onSave={(imgs, cover, sharedWith) => saveMemo(imgs, cover, sharedWith)} />}</AnimatePresence>
        <AnimatePresence>{arrivalOpen && tab === "home" && shownArrivalMemo && <ArrivalCard memo={shownArrivalMemo} onLater={() => { setArrivalOpen(false); setArrivalTarget(null); }} onCheck={() => { updateMemo(shownArrivalMemo.id, { seen: true }); setArrivalOpen(false); setArrivalTarget(null); setSelected({ ...shownArrivalMemo, seen: true }); }} />}</AnimatePresence>
        <AnimatePresence>{deleteTarget && <DeleteMemoDialog memo={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={() => deleteMemo(deleteTarget)} />}</AnimatePresence>
        <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }} className="absolute bottom-24 left-1/2 z-[80] -translate-x-1/2 whitespace-nowrap rounded-full bg-[#171a21] px-4 py-3 text-[13px] font-medium text-white shadow-xl">{toast}</motion.div>}</AnimatePresence>
        <AnimatePresence>{doneBurst && <motion.div initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0, scale: 1.7 }} className="pointer-events-none absolute inset-0 z-[90] flex items-center justify-center bg-white/30 backdrop-blur-[1px]"><div className="flex size-24 items-center justify-center rounded-full bg-primary text-white shadow-[0_18px_35px_rgba(0,196,184,0.35)]"><Check size={52} strokeWidth={3} /></div></motion.div>}</AnimatePresence>
      </section>
    </main>
  );
}

function HomeScreen({ 
  memos, 
  onSelect, 
  onComposeCurrent,
  onComposePlace,
  mapInstanceRef, 
  isDebugLocation 
}: { 
  memos: Memo[]; 
  selected: Memo | null; 
  onSelect: (m: Memo) => void; 
  onComposeCurrent: () => void;
  onComposePlace: (place: NaverPlace) => void;
  mapInstanceRef: React.MutableRefObject<any>; 
  isDebugLocation: boolean 
}) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [memoTrayOpen, setMemoTrayOpen] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  const [searchedPlaceCard, setSearchedPlaceCard] = useState<NaverPlace | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const searchedMarkerRef = useRef<any>(null);

  const q = query.trim().toLowerCase();
  
  const matchedMemos = q ? memos.filter((m) => m.place.toLowerCase().includes(q) || m.content.toLowerCase().includes(q) || (m.address && m.address.toLowerCase().includes(q))) : [];
  const matchedPlaces = q ? MOCK_PLACES.filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.roadAddress.toLowerCase().includes(q)) : [];

  const nearby = memos.find((memo) => !memo.done) ?? memos[0];

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

  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    if (!mapInstanceRef.current || mapInstanceRef.current._hwiririkContainer !== mapRef.current) {
      const initialCenter = isDebugLocation 
        ? new window.naver.maps.LatLng(TEST_LAT, TEST_LNG) 
        : new window.naver.maps.LatLng(37.5051, 126.9571);

      const mapOptions = {
        center: initialCenter,
        zoom: 16,
        zoomControl: false,
      };
      mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current._hwiririkContainer = mapRef.current;
    }

    const map = mapInstanceRef.current;

    const renderMyLocation = (lat: number, lng: number) => {
      const myLatLng = new window.naver.maps.LatLng(lat, lng);
      if (!map._myLocationMarker) {
        map._myLocationMarker = new window.naver.maps.Marker({
          position: myLatLng,
          map: map,
          icon: {
            content: `
              <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">
                <span style="position: absolute; width: 48px; height: 48px; border-radius: 50%; border: 1px solid rgba(0,196,184,0.3); background-color: rgba(0,196,184,0.15); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
                <span style="width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; background-color: #00C4B8; box-shadow: 0 4px 6px rgba(0,0,0,0.15);"></span>
              </div>
            `,
            anchor: new window.naver.maps.Point(24, 24),
          },
        });
      } else {
        map._myLocationMarker.setPosition(myLatLng);
      }
      if (memos.length === 0) map.panTo(myLatLng);
    };

    if (isDebugLocation) {
      renderMyLocation(TEST_LAT, TEST_LNG);
    } else if (navigator.geolocation && !map._myLocationMarker) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          renderMyLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("위치 권한을 불러올 수 없습니다:", error);
        }
      );
    }

    // 부착된 모든 메모 핀 지도상에 렌더링
    const markers = memos.map((memo) => {
      const bgClass = memo.done ? "bg-[#e8eaef] grayscale" : memo.shared ? "bg-white" : "bg-[#e0f9f7]";
      const innerContent = memo.coverImage
        ? `<img src="${memo.coverImage}" class="size-full object-cover rounded-2xl" />`
        : memo.done ? "✓" : `<span style="font-size:16px; font-weight:bold;">${memo.emoji}</span>`;

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
        setSearchedPlaceCard(null);
        onSelect(memo);
      });

      return marker;
    });

    return () => {
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [isMapLoaded, memos, isDebugLocation]);

  const handleSelectPlaceMock = (place: NaverPlace) => {
    setSearchOpen(false);
    setQuery("");
    setSearchedPlaceCard(place);

    if (mapInstanceRef.current && window.naver?.maps && place.lat && place.lng) {
      const targetLatLng = new window.naver.maps.LatLng(place.lat, place.lng);
      mapInstanceRef.current.panTo(targetLatLng);

      if (searchedMarkerRef.current) {
        searchedMarkerRef.current.setMap(null);
      }

      searchedMarkerRef.current = new window.naver.maps.Marker({
        position: targetLatLng,
        map: mapInstanceRef.current,
        icon: {
          content: `
            <div style="transform: translate(-50%, -100%); cursor: pointer;">
              <div class="flex size-11 items-center justify-center rounded-2xl border-2 border-white bg-primary text-white shadow-lg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </div>
            </div>
          `,
          anchor: new window.naver.maps.Point(0, 0),
        },
      });
    }
  };

  const closeSearchedCard = () => {
    setSearchedPlaceCard(null);
    if (searchedMarkerRef.current) {
      searchedMarkerRef.current.setMap(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-full overflow-hidden bg-[#f8f9fa]">
      <div id="map" ref={mapRef} className="h-full w-full" onClick={closeSearchedCard} />

      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-sm text-gray-500">
          지도를 불러오는 중입니다...
        </div>
      )}

      {/* 상단 검색바 */}
      <div className="absolute left-4 right-4 top-[20px] z-20" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-12 items-center gap-2 rounded-[17px] border border-[#e7eaf1] bg-white px-4 shadow-[0_10px_30px_rgba(30,40,70,.16)]">
          <Search size={18} className="text-muted-foreground" />
          <input
            value={query}
            onFocus={() => setSearchOpen(true)}
            onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }}
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#757575]"
            placeholder="장소 및 메모 검색"
          />
          <button onClick={() => { setQuery(""); setSearchOpen(false); }} className={query || searchOpen ? "text-muted-foreground" : "hidden"}>
            <X size={16} />
          </button>
        </div>
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-2 max-h-[60vh] overflow-y-auto rounded-[18px] border border-[#e7eaf1] bg-white shadow-[0_12px_30px_rgba(30,40,70,.14)]">
              <div className="p-2">
                {matchedMemos.length > 0 && (
                  <div className="mb-2">
                    <p className="px-3 pb-1 pt-2 text-[11px] font-bold text-primary">내 메모 목록 ({matchedMemos.length})</p>
                    {matchedMemos.map((memo) => (
                      <button key={memo.id} onClick={() => { setSearchOpen(false); setQuery(""); setSearchedPlaceCard(null); onSelect(memo); }} className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left hover:bg-[#fafbfe]">
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#f3f4f8] text-base">{memo.emoji}</span>
                        <span className="min-w-0">
                          <b className="block truncate text-[13px] font-bold">{memo.place}</b>
                          <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">{memo.content}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {matchedPlaces.length > 0 && (
                  <div>
                    <p className="px-3 pb-1 pt-2 text-[11px] font-bold text-muted-foreground">장소 목록 ({matchedPlaces.length})</p>
                    {matchedPlaces.map((place, index) => (
                      <button key={`${place.title}-${index}`} onClick={() => handleSelectPlaceMock(place)} className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left hover:bg-[#fafbfe]">
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#e0f9f7] text-primary"><MapPin size={16} /></span>
                        <span className="min-w-0">
                          <b className="block truncate text-[13px] font-bold">{place.title}</b>
                          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{place.category} · {place.roadAddress}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {q && matchedMemos.length === 0 && matchedPlaces.length === 0 && (
                  <p className="px-4 py-4 text-center text-[12px] text-muted-foreground">일치하는 장소나 메모가 없어요</p>
                )}
                {!q && (
                  <p className="px-4 py-3 text-center text-[12px] text-muted-foreground">장소명이나 작성한 메모 내용을 입력해 보세요</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 플로팅 + 버튼 */}
      <button onClick={(e) => { e.stopPropagation(); onComposeCurrent(); }} className="absolute bottom-[112px] right-[18px] z-10 flex size-[58px] items-center justify-center rounded-[29px] bg-primary text-white shadow-[0_14px_15px_rgba(0,196,184,.35)]">
        <Plus size={28} />
      </button>

      {/* 검색 장소 정보 카드 */}
      <AnimatePresence>
        {searchedPlaceCard && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-[96px] left-4 right-4 z-30 rounded-[22px] border border-white bg-white/95 p-4 shadow-[0_15px_35px_rgba(30,40,70,.18)] backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[#e0f9f7] text-primary">
                  <MapPin size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">{searchedPlaceCard.title}</h3>
                    <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{searchedPlaceCard.category}</span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{searchedPlaceCard.roadAddress || searchedPlaceCard.address}</p>
                </div>
              </div>
              <button onClick={closeSearchedCard} className="flex size-7 items-center justify-center rounded-full bg-gray-100 text-muted-foreground">
                <X size={15} />
              </button>
            </div>

            <button
              onClick={() => {
                const target = searchedPlaceCard;
                closeSearchedCard();
                onComposePlace(target);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md active:scale-[0.99]"
            >
              <Plus size={18} /> 이 장소에 메모를 작성할까요?
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 메모 트레이 */}
      {!searchedPlaceCard && (
        <div className="absolute bottom-[91px] left-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
          <AnimatePresence mode="wait">
            {memoTrayOpen && nearby ? (
              <motion.button key="expanded" initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 28, opacity: 0 }} onClick={() => onSelect(nearby)} className="w-full rounded-[20px] border border-white/80 bg-white/95 p-3 text-left shadow-[0_10px_30px_rgba(30,40,70,.12)] backdrop-blur">
                <div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-bold text-primary">가까운 메모 · 120m</span><span onClick={(event) => { event.stopPropagation(); setMemoTrayOpen(false); }} className="rounded-lg bg-[#f3f4f8] px-2 py-1 text-[10px] text-muted-foreground">내리기</span></div>
                <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-[#e0f9f7]">{nearby.emoji}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-foreground">{nearby.place}</p><p className="truncate text-[12px] text-muted-foreground">{nearby.author} · {nearby.content}</p></div><MapPin size={18} className="text-primary" /></div>
              </motion.button>
            ) : (
              <motion.button key="collapsed" initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 0, opacity: 1 }} onClick={() => setMemoTrayOpen(true)} className="mx-auto flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-4 py-3 text-[12px] font-bold text-foreground shadow-[0_10px_30px_rgba(30,40,70,.12)] backdrop-blur">
                <MapPin size={15} className="text-primary" />메모 보기 <span className="rounded-full bg-[#e0f9f7] px-1.5 py-0.5 text-[10px] text-primary">{memos.length}</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

function BottomNav({ tab, setTab }: { tab: Tab; setTab: (tab: Tab) => void }) {
  const items: { id: Tab; label: string; icon: typeof Home }[] = [{ id: "home", label: "홈", icon: Home }, { id: "family", label: "모임", icon: UsersRound }, { id: "archive", label: "보관함", icon: Archive }, { id: "my", label: "마이", icon: UserRound }];
  return <nav className="absolute bottom-0 z-40 flex h-[82px] w-full border-t border-[#edf0f5] bg-white px-5 pb-3 pt-2" onClick={(e) => e.stopPropagation()}>{items.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`flex flex-1 flex-col items-center gap-1 text-[10px] font-medium ${tab === id ? "text-primary" : "text-[#9aa0ae]"}`}><span className={`flex size-8 items-center justify-center rounded-xl ${tab === id ? "bg-[#e0f9f7]" : ""}`}><Icon size={19} strokeWidth={tab === id ? 2.6 : 1.9} /></span>{label}</button>)}</nav>;
}

function MemoDetail({ memo, onClose, onComplete, onArchive, onRequestDelete }: { memo: Memo; onClose: () => void; onComplete: () => void; onArchive: () => void; onRequestDelete: () => void }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  return (
    <motion.section initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }} className="absolute inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-white px-5 pb-8 pt-3 shadow-[0_-18px_42px_rgba(31,39,74,.18)]" onClick={(e) => e.stopPropagation()}>
      <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-[#d9dce5]" />
      <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
        <div className="min-w-0"><p className="text-[12px] font-semibold text-primary">{memo.archived ? "보관된 장소 메모" : "장소 메모"}</p><h2 className="mt-0.5 truncate text-[19px] font-bold">{memo.place}</h2>{memo.address && <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{memo.address}</p>}</div>
        <button onClick={onClose} className="flex size-9 items-center justify-center rounded-full bg-[#f3f4f8]"><X size={18} /></button>
      </div>
      {memo.coverImage && (
        <button onClick={() => setLightbox(memo.coverImage!)} className="mb-4 block w-full overflow-hidden rounded-[16px]">
          <img src={memo.coverImage} className="h-[180px] w-full object-cover" />
        </button>
      )}
      <div className="rounded-[18px] bg-[#fafbfe] p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-[14px] bg-[#e0f9f7] text-xl">{memo.emoji}</div>
          <div>
            <p className="text-[13px] text-muted-foreground">{memo.author === "나" ? "내가 남긴 메모" : `${memo.author}가 남긴 심부름`}</p>
            <p className="text-[12px] text-muted-foreground">도착 알림 · 반경 {memo.radius}m</p>
          </div>
        </div>
        {memo.content && (
          <p className={`text-[16px] leading-7 ${memo.done ? "text-[#a7acb7] line-through" : "font-medium text-foreground"}`}>{memo.content}</p>
        )}
      </div>
      <div className={`mt-3 rounded-[14px] px-3.5 py-3 ${memo.archived ? "bg-[#eafbf9]" : "bg-amber-50"}`}>
        <p className={`flex items-center gap-1.5 text-[12px] font-bold ${memo.archived ? "text-primary" : "text-amber-700"}`}>{memo.archived ? <Archive size={14} /> : <Clock3 size={14} />}{memo.archived ? "보관함에 안전하게 저장됐어요" : `${formatRemaining(memo.expiresAt)} · 이후 자동으로 사라져요`}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">{memo.archived ? "지도에서는 24시간 후 사라지지만 보관함에서는 계속 볼 수 있어요." : "기억하고 싶다면 아래에서 보관함에 저장해주세요."}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-[14px] border border-[#eef0f4] bg-white p-3 text-[11px]">
        <div><p className="text-muted-foreground">작성자</p><p className="mt-0.5 font-bold">{memo.author}</p></div>
        <div><p className="text-muted-foreground">작성일</p><p className="mt-0.5 font-bold">{formatDate(memo.createdAt)}</p></div>
        <div><p className="text-muted-foreground">완료일</p><p className="mt-0.5 font-bold">{memo.completedAt ? formatDate(memo.completedAt) : "아직 완료 전"}</p></div>
        <div><p className="text-muted-foreground">완료한 사람</p><p className="mt-0.5 font-bold">{memo.completedBy ?? "—"}</p></div>
        {memo.shared && <div className="col-span-2 border-t border-[#eef0f4] pt-2"><p className="text-muted-foreground">공유 대상</p><p className="mt-0.5 font-bold text-primary">{memo.sharedWith && memo.sharedWith.length > 0 ? memo.sharedWith.join(" · ") : "모임 전체"}</p></div>}
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
      {memo.seen && !memo.done && <p className="mt-3 rounded-xl bg-[#e0f9f7] px-3 py-2 text-[12px] font-medium text-primary">✓ 도착 메모를 확인했어요</p>}
      {memo.done && <p className="mt-3 rounded-xl bg-[#f0f2f5] px-3 py-2 text-[12px] font-medium text-[#7b8290]">{memo.completedBy ?? "김뽀꾸"}님이 심부름을 완료했어요</p>}
      <button disabled={memo.archived} onClick={onArchive} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] border py-3.5 text-sm font-bold ${memo.archived ? "border-primary/20 bg-[#eafbf9] text-primary" : "border-primary bg-white text-primary"}`}><Archive size={17} />{memo.archived ? "보관함에 저장됨" : "보관함에 저장"}{memo.archived && <Check size={15} />}</button>
      {memo.author === "나" && <button onClick={onRequestDelete} className="mt-2 flex w-full items-center justify-center gap-2 rounded-[14px] border border-rose-200 bg-rose-50 py-3.5 text-sm font-bold text-rose-500"><Trash2 size={17} />내 메모 삭제</button>}
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

function SelectedPlaceMap({ place }: { place: NaverPlace }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;

    const createMap = () => {
      if (cancelled) return;

      if (!mapRef.current || !window.naver?.maps) {
        attempts += 1;
        if (attempts >= 50) {
          setMapStatus("error");
          return;
        }
        timer = window.setTimeout(createMap, 100);
        return;
      }

      const center = new window.naver.maps.LatLng(place.lat ?? 37.5051, place.lng ?? 126.9571);
      const map = new window.naver.maps.Map(mapRef.current, {
        center,
        zoom: 17,
        zoomControl: false,
        draggable: false,
        scrollWheel: false,
        pinchZoom: false,
        keyboardShortcuts: false,
        disableDoubleTapZoom: true,
        disableDoubleClickZoom: true,
        disableTwoFingerTapZoom: true,
      });

      setMapStatus("ready");
      timer = window.setTimeout(() => {
        if (!cancelled) window.naver.maps.Event.trigger(map, "resize");
      }, 80);
    };

    timer = window.setTimeout(createMap, 20);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [place.lat, place.lng]);

  return (
    <div className="absolute inset-0">
      <div ref={mapRef} className="h-full w-full" aria-label={`${place.title} 지도`} />
      {mapStatus === "loading" && <div className="absolute inset-0 flex items-center justify-center bg-[#f3f5f7] text-[11px] text-muted-foreground">지도를 불러오는 중이에요...</div>}
      {mapStatus === "error" && <div className="absolute inset-0 flex items-center justify-center bg-[#f3f5f7] text-[11px] text-muted-foreground">지도를 불러오지 못했어요</div>}
      {mapStatus === "ready" && <span className="pointer-events-none absolute left-1/2 top-[52%] flex size-9 -translate-x-1/2 -translate-y-full items-center justify-center rounded-2xl border-2 border-white bg-primary text-white shadow-lg"><MapPin size={17} fill="currentColor" /></span>}
    </div>
  );
}

function Composer(props: { place: string; selectedPlace: NaverPlace | null; content: string; shared: boolean; radius: number; setPlace: (v: string) => void; setSelectedPlace: (v: NaverPlace | null) => void; setContent: (v: string) => void; setShared: (v: boolean) => void; setRadius: (v: number) => void; onClose: () => void; onSave: (images: string[], coverImage: string, sharedWith: FamilyMember[]) => void }) {
  const [images, setImages] = useState<string[]>([]);
  const [coverIdx, setCoverIdx] = useState<number>(0);
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [sharePickerOpen, setSharePickerOpen] = useState(false);
  const [sharedWith, setSharedWith] = useState<FamilyMember[]>([]);
  const [shareDraft, setShareDraft] = useState<FamilyMember[]>([]);
  const [placeQuery, setPlaceQuery] = useState(props.place);
  const [placeSearchOpen, setPlaceSearchOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState("현재 위치를 켜면 가까운 장소부터 볼 수 있어요");
  const galleryRef = React.useRef<HTMLInputElement>(null);
  const cameraRef = React.useRef<HTMLInputElement>(null);
  const { places: placeResults, loading: placeLoading } = useNaverPlaceSearch(placeQuery);

  const visiblePlaces = (placeQuery.trim() ? placeResults : MOCK_PLACES)
    .map((place) => ({
      ...place,
      distance: currentLocation ? distanceMeters(currentLocation.lat, currentLocation.lng, place.lat, place.lng) : place.distance,
    }))
    .sort((a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY));

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("이 기기에서는 현재 위치를 사용할 수 없어요");
      return;
    }
    setLocationStatus("현재 위치를 확인하고 있어요...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus("현재 위치에서 가까운 순서로 보여드려요");
        setPlaceSearchOpen(true);
      },
      () => setLocationStatus("위치 권한을 허용하면 가까운 장소부터 볼 수 있어요"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const choosePlace = (place: NaverPlace) => {
    props.setPlace(place.title);
    props.setSelectedPlace(place);
    setPlaceQuery(place.title);
    setPlaceSearchOpen(false);
  };

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

  const toggleShareMember = (member: FamilyMember) => {
    setShareDraft((members) => members.includes(member) ? members.filter((name) => name !== member) : [...members, member]);
  };

  const openSharePicker = () => {
    setShareDraft(sharedWith);
    props.setShared(true);
    setSharePickerOpen(true);
  };

  const closeSharePicker = () => {
    setShareDraft(sharedWith);
    setSharePickerOpen(false);
    if (sharedWith.length === 0) props.setShared(false);
  };

  const canSave = props.place.trim() && (props.content.trim() || images.length > 0) && (!props.shared || sharedWith.length > 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[70] bg-[#171a21]/25 backdrop-blur-[1px]" onClick={(e) => e.stopPropagation()}>
      <AnimatePresence>
        {photoPickerOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPhotoPickerOpen(false)} className="absolute inset-0 z-[80] flex items-end justify-center pb-6">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 320 }} onClick={(e) => e.stopPropagation()} className="mx-4 w-full max-w-sm overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_rgba(20,20,50,.22)]">
              <p className="border-b border-[#f0f1f5] px-5 py-4 text-center text-[13px] font-semibold text-muted-foreground">사진 추가 방법 선택</p>
              <button onClick={handleCameraClick} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[#fafbfe] active:bg-[#f3f4f8]">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-[#e0f9f7] text-primary"><Camera size={20} /></span>
                <div><p className="text-[15px] font-bold">사진 촬영</p><p className="text-[12px] text-muted-foreground">카메라로 바로 찍기</p></div>
              </button>
              <div className="mx-5 border-t border-[#f0f1f5]" />
              <button onClick={() => { setPhotoPickerOpen(false); galleryRef.current?.click(); }} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[#fafbfe] active:bg-[#f3f4f8]">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-[#e0f9f7] text-primary"><Image size={20} /></span>
                <div><p className="text-[15px] font-bold">사진 첨부</p><p className="text-[12px] text-muted-foreground">갤러리에서 선택</p></div>
              </button>
              <div className="px-4 pb-4 pt-2">
                <button onClick={() => setPhotoPickerOpen(false)} className="w-full rounded-[14px] bg-[#f3f4f8] py-3 text-[14px] font-bold text-[#5f6674]">취소</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
      <AnimatePresence>
        {sharePickerOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeSharePicker} className="absolute inset-0 z-[85] flex items-center justify-center bg-black/35 px-6">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 12 }} transition={{ type: "spring", damping: 25, stiffness: 340 }} onClick={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-[22px] bg-white p-6 shadow-[0_20px_55px_rgba(20,20,50,.24)]">
              <div className="text-center"><span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#e0f9f7] text-primary"><UsersRound size={26} /></span><h3 className="mt-4 text-[18px] font-bold">누구와 공유할까요?</h3><p className="mt-1 text-[12px] text-muted-foreground">엄마, 아빠, 김뽀꾸 중 함께 볼 사람을 선택해 주세요.</p></div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {(["엄마", "아빠", "김뽀꾸"] as FamilyMember[]).map((member) => {
                  const isSelected = shareDraft.includes(member);
                  return <button type="button" key={member} onClick={() => toggleShareMember(member)} className={`relative flex flex-col items-center gap-2 rounded-[16px] border py-4 text-[14px] font-bold transition-colors ${isSelected ? "border-primary bg-[#e0f9f7] text-primary" : "border-border bg-white text-foreground"}`}>
                    <span className={`flex size-11 items-center justify-center rounded-2xl text-[15px] ${member === "엄마" ? "bg-rose-100 text-rose-500" : member === "아빠" ? "bg-sky-100 text-sky-600" : "bg-violet-100 text-violet-600"}`}>{member.slice(0, 1)}</span>
                    {member}
                    {isSelected && <span className="absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-white"><Check size={12} strokeWidth={3} /></span>}
                  </button>;
                })}
              </div>
              <div className="mt-5 flex gap-2"><button type="button" onClick={closeSharePicker} className="flex-1 rounded-[13px] border border-border py-3 text-[13px] font-bold text-[#5f6674]">취소</button><button type="button" disabled={shareDraft.length === 0} onClick={() => { setSharedWith(shareDraft); props.setShared(true); setSharePickerOpen(false); }} className="flex-1 rounded-[13px] bg-primary py-3 text-[13px] font-bold text-white disabled:bg-[#7eeae6]">선택 완료</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
      <motion.section initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 29, stiffness: 300 }} className="absolute inset-x-0 bottom-0 flex max-h-[90vh] flex-col rounded-t-[28px] bg-white px-5 pb-8 pt-3">
        <div className="mx-auto mb-4 h-1.5 w-11 shrink-0 rounded-full bg-[#d9dce5]" />
        <div className="mb-5 flex shrink-0 items-center justify-between">
          <div><p className="text-[12px] font-semibold text-primary">새로운 장소 메모</p><h2 className="text-xl font-bold">어디에 붙일까요?</h2></div>
          <button onClick={props.onClose} className="flex size-9 items-center justify-center rounded-full bg-[#f3f4f8]"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[13px] font-bold">장소 검색</p>
                <button type="button" onClick={requestCurrentLocation} className="flex items-center gap-1 rounded-full bg-[#e0f9f7] px-2.5 py-1.5 text-[10px] font-bold text-primary"><LocateFixed size={12} />내 위치</button>
              </div>
              <div className={`flex h-12 items-center gap-2 rounded-[13px] border bg-[#fafbfe] px-3 ${placeSearchOpen ? "border-primary" : "border-border"}`}>
                <Search size={16} className="shrink-0 text-muted-foreground" />
                <input
                  value={placeQuery}
                  onFocus={() => setPlaceSearchOpen(true)}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPlaceQuery(value);
                    props.setPlace(value);
                    props.setSelectedPlace(null);
                    setPlaceSearchOpen(true);
                  }}
                  placeholder="예: 다이소, 중앙약국"
                  className="w-full bg-transparent text-sm font-normal outline-none"
                />
                {(placeQuery || placeSearchOpen) && <button type="button" onClick={() => { setPlaceQuery(""); props.setPlace(""); props.setSelectedPlace(null); setPlaceSearchOpen(false); }} className="text-muted-foreground"><X size={15} /></button>}
              </div>
              <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground"><LocateFixed size={11} className={currentLocation ? "text-primary" : ""} />{locationStatus}</p>

              <AnimatePresence>
                {placeSearchOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-2 max-h-[190px] overflow-y-auto rounded-[14px] border border-[#e7eaf1] bg-white shadow-[0_8px_22px_rgba(30,40,70,.10)]">
                    {placeLoading && placeQuery.trim() && <p className="px-4 py-4 text-center text-[12px] text-muted-foreground">장소를 검색하고 있어요...</p>}
                    {!placeLoading && visiblePlaces.length === 0 && <p className="px-4 py-4 text-center text-[12px] text-muted-foreground">검색 결과가 없어요</p>}
                    {(!placeLoading || !placeQuery.trim()) && visiblePlaces.map((place, index) => (
                      <button type="button" key={`${place.title}-${index}`} onClick={() => choosePlace(place)} className="flex w-full items-center gap-3 border-b border-[#f0f1f5] px-3 py-2.5 text-left last:border-b-0 hover:bg-[#fafbfe]">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#e0f9f7] text-primary"><MapPin size={16} /></span>
                        <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><b className="truncate text-[13px]">{place.title}</b><em className="shrink-0 text-[10px] not-italic text-primary">{formatDistance(place.distance)}</em></span><span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{place.category} · {place.roadAddress}</span></span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {props.selectedPlace && !placeSearchOpen && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="relative mt-2 h-[118px] overflow-hidden rounded-[14px] border border-primary/20 bg-[#f8f9fa]">
                  <SelectedPlaceMap place={props.selectedPlace} />
                  <div className="absolute inset-x-2 bottom-2 flex items-center gap-2 rounded-[11px] bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
                    <span className="min-w-0 flex-1"><b className="block truncate text-[12px]">{props.selectedPlace.title}</b><span className="block truncate text-[9px] text-muted-foreground">{props.selectedPlace.roadAddress || props.selectedPlace.address}</span></span>
                    <button type="button" onClick={() => setPlaceSearchOpen(true)} className="shrink-0 rounded-lg bg-[#e0f9f7] px-2 py-1 text-[10px] font-bold text-primary">장소 변경</button>
                  </div>
                </motion.div>
              )}
            </div>
            <div>
              <p className="mb-1.5 text-[13px] font-bold">
                메모 내용 {images.length > 0 && <span className="font-normal text-muted-foreground">(선택)</span>}
              </p>
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
                <button onClick={() => { props.setShared(false); setSharedWith([]); setShareDraft([]); }} className={`rounded-[10px] py-2.5 text-[13px] font-bold ${!props.shared ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>나만 보기</button>
                <button onClick={openSharePicker} className={`rounded-[10px] py-2.5 text-[13px] font-bold ${props.shared ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>모임 공유</button>
              </div>
              {props.shared && sharedWith.length > 0 && <button type="button" onClick={openSharePicker} className="mt-2 flex w-full items-center justify-between rounded-[12px] border border-primary/20 bg-[#f3fcfb] px-3 py-2.5 text-left"><span className="text-[11px] text-muted-foreground">공유 대상</span><span className="flex items-center gap-1.5 text-[12px] font-bold text-primary">{sharedWith.join(" · ")}<ChevronLeft size={14} className="rotate-180" /></span></button>}
            </div>
            <div>
              <p className="mb-2 text-[13px] font-bold">도착 알림 반경</p>
              <div className="flex gap-2">{[50, 100, 300].map((v) => <button key={v} onClick={() => props.setRadius(v)} className={`flex-1 rounded-xl border py-2 text-[12px] font-bold ${props.radius === v ? "border-primary bg-[#e0f9f7] text-primary" : "border-border text-muted-foreground"}`}>{v}m</button>)}</div>
              <p className="mt-2 flex items-start gap-1 text-[10px] leading-4 text-muted-foreground"><BellRing size={11} className="mt-0.5 shrink-0 text-primary" />메모를 저장할 때 알림 권한을 허용하면, 앱을 사용하는 동안 이 거리 안에서 알림센터로 알려드려요.</p>
            </div>
          </div>
        </div>
        <button disabled={!canSave} onClick={() => props.onSave(images, images[coverIdx] ?? "", sharedWith)} className="mt-4 w-full shrink-0 rounded-[15px] bg-primary py-3.5 text-sm font-bold text-white disabled:bg-[#7eeae6]">메모 붙이기</button>
      </motion.section>
    </motion.div>
  );
}

// 근처 도착 알림 카드 (파비콘 아이콘 노출 반영)
function ArrivalCard({ memo, onLater, onCheck }: { memo: Memo; onLater: () => void; onCheck: () => void }) {
  return (
    <motion.section initial={{ y: 160, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 160, opacity: 0 }} transition={{ type: "spring", damping: 23, stiffness: 320 }} className="absolute inset-x-4 bottom-[96px] z-[35] rounded-[22px] border border-white bg-white p-4 shadow-[0_18px_45px_rgba(39,39,74,.20)]" onClick={(e) => e.stopPropagation()}>
      <div className="mb-3 flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#e0f9f7] p-2">
          <img src="/favicon.ico" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} className="size-6 object-contain" alt="파비콘" />
        </div>
        <div><p className="text-[16px] font-bold">{memo.place} 근처에 도착했어요!</p><p className="mt-1 text-[12px] leading-5 text-muted-foreground">{memo.author}가 남긴 심부름 — {memo.content}</p></div>
      </div>
      <div className="flex gap-2"><button onClick={onLater} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#f3f4f8] py-2.5 text-[12px] font-bold text-[#697080]"><X size={15} /> 나중에 보기</button><button onClick={onCheck} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-[12px] font-bold text-white"><Check size={15} /> 확인했어요</button></div>
    </motion.section>
  );
}

function FamilyScreen({ memos, onSelect, setTab }: { memos: Memo[]; onSelect: (m: Memo) => void; setTab: (tab: Tab) => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto bg-[#f7f8fb] px-5 pb-28 pt-[61px]" onClick={(e) => e.stopPropagation()}>
      <div className="mb-6"><p className="text-[12px] font-bold text-primary">우리 모임의 장소 메모</p><h1 className="mt-1 text-[24px] font-bold">모임 심부름</h1></div>
      <div className="space-y-3">
        {memos.map((memo) => <button onClick={() => onSelect(memo)} key={memo.id} className="w-full rounded-[20px] bg-white p-4 text-left shadow-[0_8px_25px_rgba(30,40,70,.06)]"><div className="flex gap-3"><Avatar name={memo.author} /><div className="min-w-0 flex-1"><div className="flex items-center justify-between"><p className="text-[14px] font-bold">{memo.author}</p><span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock3 size={11} />{formatRemaining(memo.expiresAt)}</span></div><p className="mt-0.5 flex items-center gap-1 text-[12px] text-primary"><MapPin size={12} />{memo.place}</p><p className={`mt-2 text-[14px] leading-5 ${memo.done ? "text-[#a6abb6] line-through" : "text-foreground"}`}>{memo.content}</p>{memo.done && <p className="mt-3 rounded-lg bg-[#f0f2f5] px-2.5 py-2 text-[11px] font-medium text-[#7b8290]">{memo.completedBy ?? "김뽀꾸"}님이 심부름을 완료했어요</p>}</div></div></button>)}
        {!memos.length && <div className="rounded-[20px] bg-white p-5 text-center text-sm text-muted-foreground">지금은 공유된 메모가 없어요.</div>}
      </div>
      <BottomNav tab="family" setTab={setTab} />
    </motion.div>
  );
}

function ArchiveScreen({ memos, setTab, onSelect, onRequestDelete }: { memos: Memo[]; setTab: (tab: Tab) => void; onSelect: (memo: Memo) => void; onRequestDelete: (memo: Memo) => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto bg-[#f7f8fb] px-5 pb-28 pt-[61px]" onClick={(e) => e.stopPropagation()}>
      <p className="text-[12px] font-bold text-primary">24시간 뒤에도 남겨두는 기억</p>
      <h1 className="mt-1 text-[24px] font-bold">보관함</h1>
      <p className="mt-1 text-[11px] text-muted-foreground">보관한 메모는 시간이 지나도 사라지지 않아요.</p>
      <div className="mt-5 space-y-3">
        {memos.map((memo) => (
          <article key={memo.id} className="rounded-[20px] bg-white p-4 shadow-[0_8px_25px_rgba(30,40,70,.06)]">
            <button onClick={() => onSelect(memo)} className="w-full text-left">
              <p className="flex items-center gap-1 text-[13px] font-bold text-primary"><MapPin size={13} />{memo.place}</p>
              {memo.address && <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{memo.address}</p>}
              <p className="mt-2 text-[14px] leading-5 text-foreground">{memo.content || "사진으로 남긴 메모"}</p>
              {memo.images?.length ? <div className="mt-3 flex gap-2 overflow-hidden">{memo.images.slice(0, 3).map((image, index) => <img key={index} src={image} className="size-14 rounded-xl object-cover" />)}</div> : null}
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-[#eef0f4] pt-3 text-[10px]">
                <div><span className="text-muted-foreground">작성자</span><b className="ml-1">{memo.author}</b></div>
                <div><span className="text-muted-foreground">작성일</span><b className="ml-1">{formatDate(memo.createdAt)}</b></div>
                <div><span className="text-muted-foreground">완료일</span><b className="ml-1">{memo.completedAt ? formatDate(memo.completedAt) : "—"}</b></div>
                <div><span className="text-muted-foreground">완료한 사람</span><b className="ml-1">{memo.completedBy ?? "—"}</b></div>
              </div>
            </button>
            {memo.author === "나" && <button onClick={() => onRequestDelete(memo)} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-50 py-2.5 text-[12px] font-bold text-rose-500"><Trash2 size={14} />이 메모 삭제</button>}
          </article>
        ))}
        {!memos.length && <div className="rounded-[20px] bg-white p-5 text-center text-sm text-muted-foreground">아직 보관한 메모가 없어요.</div>}
      </div>
      <BottomNav tab="archive" setTab={setTab} />
    </motion.div>
  );
}

function MyScreen({ memos, setTab, myMemosOpen, setMyMemosOpen, onSelect, onRequestDelete }: { memos: Memo[]; setTab: (tab: Tab) => void; myMemosOpen: boolean; setMyMemosOpen: (value: boolean) => void; onSelect: (memo: Memo) => void; onRequestDelete: (memo: Memo) => void }) {
  const ownMemos = memos.filter((memo) => memo.author === "나");
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto bg-[#f7f8fb] px-5 pb-28 pt-[61px]" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-3"><Avatar name="나" /><div><p className="text-lg font-bold">김뽀꾸님</p><p className="text-[12px] text-muted-foreground">나의 장소 메모 {ownMemos.length}개</p></div></div>
      {myMemosOpen ? (
        <div className="mt-7">
          <button onClick={() => setMyMemosOpen(false)} className="mb-3 flex items-center gap-1 text-[13px] font-bold text-primary"><ChevronLeft size={17} /> 설정으로</button>
          <h2 className="mb-3 text-[19px] font-bold">내 메모 보기</h2>
          <div className="space-y-2">
            {ownMemos.map((memo) => <article key={memo.id} className="flex items-center gap-2 rounded-[17px] bg-white p-3"><button onClick={() => onSelect(memo)} className="min-w-0 flex-1 text-left"><p className="flex items-center gap-1 truncate text-[12px] text-primary"><MapPin size={13} />{memo.place}</p><p className="mt-1 truncate text-[14px] font-medium">{memo.content || "사진으로 남긴 메모"}</p><p className="mt-1 text-[9px] text-muted-foreground">{formatRemaining(memo.expiresAt)}</p></button><button onClick={() => onRequestDelete(memo)} className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500" aria-label="내 메모 삭제"><Trash2 size={16} /></button></article>)}
            {!ownMemos.length && <div className="rounded-[17px] bg-white p-4 text-center text-sm text-muted-foreground">아직 내가 남긴 메모가 없어요.</div>}
          </div>
        </div>
      ) : (
        <div className="mt-7 space-y-3"><button onClick={() => setMyMemosOpen(true)} className="w-full rounded-[18px] bg-white p-4 text-left text-sm font-semibold">내 메모 보기 <MapPin className="float-right text-primary" size={18} /></button><div className="rounded-[18px] bg-white p-4 text-sm font-semibold">알림 설정 <BellRing className="float-right text-primary" size={18} /></div><div className="rounded-[18px] bg-white p-4 text-sm font-semibold">모임 관리 <UsersRound className="float-right text-primary" size={18} /></div></div>
      )}
      <BottomNav tab="my" setTab={setTab} />
    </motion.div>
  );
}

function DeleteMemoDialog({ memo, onCancel, onConfirm }: { memo: Memo; onCancel: () => void; onConfirm: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[110] flex items-center justify-center bg-black/35 px-6 backdrop-blur-[2px]" onClick={(event) => { event.stopPropagation(); onCancel(); }}>
      <motion.div initial={{ scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 12 }} transition={{ type: "spring", damping: 24, stiffness: 340 }} className="w-full max-w-sm rounded-[22px] bg-white p-5 shadow-[0_20px_50px_rgba(20,20,50,.24)]" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex flex-col items-center text-center"><span className="mb-3 flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-500"><Trash2 size={26} /></span><h3 className="text-[18px] font-bold">정말 삭제할까요?</h3><p className="mt-2 text-[12px] leading-5 text-muted-foreground">‘{memo.place}’ 메모가 완전히 사라져요.<br />삭제한 뒤에는 되돌릴 수 없어요.</p></div>
        <div className="flex gap-2"><button onClick={onCancel} className="flex-1 rounded-[13px] border border-border py-3 text-[14px] font-semibold text-[#5f6674]">취소</button><button onClick={onConfirm} className="flex-1 rounded-[13px] bg-rose-500 py-3 text-[14px] font-bold text-white">완전히 삭제</button></div>
      </motion.div>
    </motion.div>
  );
}
  content: string;
  author: string;
  emoji: string;
  shared: boolean;
  sharedWith?: FamilyMember[];
  radius: number;
  time: string;
  done?: boolean;
  seen?: boolean;
  lat: number;
  lng: number;
  images?: string[];
  coverImage?: string;
  address?: string;
  createdAt: string;
  expiresAt: string;
  archived: boolean;
  archivedAt?: string;
  completedAt?: string;
  completedBy?: string;
};

type NaverPlace = {
  title: string;
  category: string;
  address: string;
  roadAddress: string;
  lat?: number;
  lng?: number;
  distance?: number;
};

// 고정 테스트 좌표 (위도: 37.504452, 경도: 126.956481)
const TEST_LAT = 37.504452;
const TEST_LNG = 126.956481;
const HOUR = 60 * 60 * 1000;
const MEMO_STORAGE_KEY = "hwiririk-memos-v3";

const MOCK_PLACES: NaverPlace[] = [
  { title: "이마트 흑석점", category: "대형마트", address: "서울특별시 동작구 흑석동 97", roadAddress: "서울특별시 동작구 흑석로 97", lat: 37.5082, lng: 126.9635 },
  { title: "중앙약국", category: "약국", address: "서울특별시 동작구 흑석동 102", roadAddress: "서울특별시 동작구 흑석로 102", lat: 37.5071, lng: 126.9585 },
  { title: "올리브영 중앙대점", category: "헬스앤뷰티", address: "서울특별시 동작구 흑석동 195-17", roadAddress: "서울특별시 동작구 흑석로 81", lat: 37.5062, lng: 126.9573 },
  { title: "중앙대학교 정문", category: "대학교", address: "서울특별시 동작구 흑석동 84", roadAddress: "서울특별시 동작구 흑석로 84", lat: 37.5051, lng: 126.9571 },
  { title: "흑석한강공원", category: "공원", address: "서울특별시 동작구 흑석동 1", roadAddress: "서울특별시 동작구 흑석로 1", lat: 37.5095, lng: 126.9610 },
  { title: "이마트24 흑석점", category: "편의점", address: "서울특별시 동작구 흑석동 201", roadAddress: "서울특별시 동작구 흑석로 201", lat: 37.5060, lng: 126.9590 },
  { title: "다이소 흑석역점", category: "생활용품점", address: "서울특별시 동작구 흑석동 100-16", roadAddress: "서울특별시 동작구 서달로 161-1", lat: 37.5076, lng: 126.9602 },
  { title: "다이소 상도역점", category: "생활용품점", address: "서울특별시 동작구 상도1동", roadAddress: "서울특별시 동작구 상도로 277", lat: 37.5028, lng: 126.9475 },
];

function distanceMeters(fromLat: number, fromLng: number, toLat?: number, toLng?: number) {
  if (toLat == null || toLng == null) return Number.POSITIVE_INFINITY;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(distance?: number) {
  if (distance == null || !Number.isFinite(distance)) return "거리 확인 전";
  if (distance < 1000) return `${Math.max(1, Math.round(distance))}m`;
  return `${(distance / 1000).toFixed(1)}km`;
}

function getEmojiByCategory(category?: string, content?: string, place?: string): string {
  if (category) {
    if (category.includes("마트") || category.includes("편의점") || category.includes("생활용품")) return "🛒";
    if (category.includes("약국") || category.includes("병원")) return "💊";
    if (category.includes("학교") || category.includes("대학교")) return "🎓";
    if (category.includes("공원") || category.includes("산")) return "🌳";
    if (category.includes("식당") || category.includes("음식점") || category.includes("카페")) return "☕";
  }
  return "📍";
}

function useNaverPlaceSearch(query: string): { places: NaverPlace[]; loading: boolean } {
  const [places, setPlaces] = useState<NaverPlace[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setPlaces([]);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(() => {
      const filtered = MOCK_PLACES.filter((p) => p.title.includes(q) || p.category.includes(q) || p.address.includes(q) || p.roadAddress.includes(q));
      setPlaces(filtered);
      setLoading(false);
    }, 150);

    return () => window.clearTimeout(timer);
  }, [query]);

  return { places, loading };
}

function initialMemos(): Memo[] {
  const now = Date.now();
  return [
    { id: 1, place: "이마트 흑석점", content: "우유, 계란, 휴지 사오기", author: "엄마", emoji: "🛒", shared: true, radius: 100, time: "22시간 남음", lat: 37.5082, lng: 126.9635, address: "서울특별시 동작구 흑석로 97", createdAt: new Date(now - 2 * HOUR).toISOString(), expiresAt: new Date(now + 22 * HOUR).toISOString(), archived: false },
    { id: 2, place: "중앙약국", content: "할머니 약 받아오기", author: "아빠", emoji: "💊", shared: true, radius: 300, time: "19시간 남음", lat: 37.5071, lng: 126.9585, address: "서울특별시 동작구 흑석로 102", createdAt: new Date(now - 5 * HOUR).toISOString(), expiresAt: new Date(now + 19 * HOUR).toISOString(), archived: false },
    { id: 3, place: "중앙대학교 정문", content: "학생지원팀에서 증명서 출력하기", author: "나", emoji: "🎓", shared: false, radius: 100, time: "23시간 남음", lat: 37.5051, lng: 126.9571, address: "서울특별시 동작구 흑석로 84", createdAt: new Date(now - HOUR).toISOString(), expiresAt: new Date(now + 23 * HOUR).toISOString(), archived: true, archivedAt: new Date(now - 30 * 60 * 1000).toISOString() },
  ];
}

function normalizeMemo(memo: Partial<Memo> & Pick<Memo, "id" | "place" | "content" | "author" | "emoji" | "shared" | "radius" | "time" | "lat" | "lng">): Memo {
  const createdAt = memo.createdAt ?? new Date().toISOString();
  return {
    ...memo,
    images: memo.images ?? [],
    sharedWith: memo.sharedWith ?? [],
    createdAt,
    expiresAt: memo.expiresAt ?? new Date(new Date(createdAt).getTime() + 24 * HOUR).toISOString(),
    archived: memo.archived ?? false,
    completedAt: memo.completedAt ?? (memo.done ? createdAt : undefined),
    completedBy: memo.completedBy ?? (memo.done ? "김뽀꾸" : undefined),
  };
}

function loadMemos(): Memo[] {
  try {
    const saved = window.localStorage.getItem(MEMO_STORAGE_KEY);
    if (!saved) return initialMemos();
    const parsed = JSON.parse(saved) as Memo[];
    if (!Array.isArray(parsed)) return initialMemos();
    const normalized = parsed.map(normalizeMemo).filter((memo) => memo.archived || new Date(memo.expiresAt).getTime() > Date.now());
    const savedIds = new Set(normalized.map((memo) => memo.id));
    const restoredDemoMemos = initialMemos().filter((memo) => !memo.archived && !savedIds.has(memo.id));
    return [...restoredDemoMemos, ...normalized];
  } catch {
    return initialMemos();
  }
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatRemaining(expiresAt: string) {
  const minutes = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 60000));
  if (minutes >= 60) return `${Math.floor(minutes / 60)}시간 ${minutes % 60}분 남음`;
  return `${minutes}분 남음`;
}

function Avatar({ name }: { name: string }) {
  const colors: Record<string, string> = { 엄마: "bg-rose-100 text-rose-500", 아빠: "bg-sky-100 text-sky-600", 나: "bg-teal-100 text-primary" };
  return <div className={`flex size-10 items-center justify-center rounded-2xl text-sm font-bold ${colors[name] ?? "bg-teal-100 text-primary"}`}>{name === "나" ? "뽀" : name.slice(0, 1)}</div>;
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [memos, setMemos] = useState<Memo[]>(loadMemos);
  const [now, setNow] = useState(Date.now());
  const [selected, setSelected] = useState<Memo | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [arrivalOpen, setArrivalOpen] = useState(false);
  const [arrivalTarget, setArrivalTarget] = useState<Memo | null>(null);
  const [toast, setToast] = useState("");
  const [place, setPlace] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<NaverPlace | null>(null);
  const [content, setContent] = useState("");
  const [shared, setShared] = useState(false);
  const [radius, setRadius] = useState(100);
  const [doneBurst, setDoneBurst] = useState(false);
  const [myMemosOpen, setMyMemosOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Memo | null>(null);
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 개발자 테스트용 상태 (5회 연속 클릭 트리거)
  const [isDebugLocation, setIsDebugLocation] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<number | null>(null);
  const notifiedMemoIdsRef = useRef<Set<number>>(new Set());

  const mapInstanceRef = useRef<any>(null);

  // 사용자 실제 위치 추적
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => undefined,
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    try {
      window.localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(memos));
    } catch {
      // 사진 데이터 용량 초과 대응
    }
  }, [memos]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setMemos((items) => items.filter((memo) => memo.archived || new Date(memo.expiresAt).getTime() > now));
  }, [now]);

  useEffect(() => {
    if (selected && !memos.some((memo) => memo.id === selected.id)) setSelected(null);
  }, [memos, selected]);

  // 화면 연속 5회 타격 시 개발자 테스트 모드 토글
  const handleSecretTap = () => {
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      setIsDebugLocation(true);
      setToast("🧪 개발자 모드: 현위치가 테스트 좌표로 고정되었습니다 (37.504452, 126.956481)");

      if (mapInstanceRef.current && window.naver?.maps) {
        const testLatLng = new window.naver.maps.LatLng(TEST_LAT, TEST_LNG);
        mapInstanceRef.current.panTo(testLatLng);

        if (mapInstanceRef.current._myLocationMarker) {
          mapInstanceRef.current._myLocationMarker.setPosition(testLatLng);
        }
      }
    } else {
      clickTimerRef.current = window.setTimeout(() => {
        clickCountRef.current = 0;
      }, 1500);
    }
  };

  const updateMemo = (id: number, patch: Partial<Memo>) => {
    setMemos((items) => items.map((memo) => (memo.id === id ? { ...memo, ...patch } : memo)));
    setSelected((memo) => (memo?.id === id ? { ...memo, ...patch } : memo));
  };

  const openComposerWithCurrentLocation = () => {
    setPlace("");
    setSelectedPlace(null);
    setComposerOpen(true);
  };

  const openComposerWithPlace = (targetPlace: NaverPlace) => {
    setPlace(targetPlace.title);
    setSelectedPlace(targetPlace);
    setComposerOpen(true);
  };

  // 장소에 메모 저장하기
  const saveMemo = (images: string[], coverImage: string, sharedWith: FamilyMember[]) => {
    if (!place.trim() || (!content.trim() && images.length === 0)) return;

    let targetLat = TEST_LAT;
    let targetLng = TEST_LNG;

    if (selectedPlace?.lat && selectedPlace?.lng) {
      targetLat = selectedPlace.lat;
      targetLng = selectedPlace.lng;
    } else if (isDebugLocation) {
      targetLat = TEST_LAT;
      targetLng = TEST_LNG;
    } else if (userLocation) {
      targetLat = userLocation.lat;
      targetLng = userLocation.lng;
    } else if (mapInstanceRef.current && window.naver?.maps) {
      const center = mapInstanceRef.current.getCenter();
      targetLat = center.lat();
      targetLng = center.lng();
    }

    // 카테고리 기반 이모지 지정 (실패 시 내용 첫 글자)
    const memoEmoji = getEmojiByCategory(selectedPlace?.category, content, place);
    const createdAt = new Date().toISOString();

    const memo: Memo = {
      id: Date.now(),
      place,
      content,
      author: "나",
      emoji: memoEmoji,
      shared,
      sharedWith: shared ? sharedWith : [],
      radius,
      time: "24시간 남음",
      lat: targetLat,
      lng: targetLng,
      images,
      coverImage: coverImage || undefined,
      address: selectedPlace?.roadAddress || selectedPlace?.address,
      createdAt,
      expiresAt: new Date(Date.now() + 24 * HOUR).toISOString(),
      archived: false,
    };

    setMemos((items) => [memo, ...items]);
    setComposerOpen(false);
    setPlace("");
    setSelectedPlace(null);
    setContent("");
    setShared(false);
    setToast("장소에 메모를 부착하고 핀을 꼽았어요!");

    if ("Notification" in window && window.Notification.permission === "default") {
      void window.Notification.requestPermission();
    }

    if (mapInstanceRef.current && window.naver?.maps) {
      mapInstanceRef.current.panTo(new window.naver.maps.LatLng(targetLat, targetLng));
    }
  };

  const complete = (memo: Memo) => {
    updateMemo(memo.id, { done: true, seen: true, completedAt: new Date().toISOString(), completedBy: "김뽀꾸" });
    setDoneBurst(true);
    window.setTimeout(() => setDoneBurst(false), 1200);
  };

  const archiveMemo = (memo: Memo) => {
    if (memo.archived) return;
    updateMemo(memo.id, { archived: true, archivedAt: new Date().toISOString() });
    setToast("보관함에 저장했어요");
  };

  const deleteMemo = (memo: Memo) => {
    if (memo.author !== "나") {
      setDeleteTarget(null);
      setToast("내가 작성한 메모만 삭제할 수 있어요");
      return;
    }
    setMemos((items) => items.filter((item) => item.id !== memo.id));
    setSelected((item) => (item?.id === memo.id ? null : item));
    setDeleteTarget(null);
    setToast("메모를 완전히 삭제했어요");
  };

  const activeMemos = memos.filter((memo) => new Date(memo.expiresAt).getTime() > now);
  const familyMemos = activeMemos.filter((memo) => memo.shared);
  const archivedMemos = memos.filter((memo) => memo.archived);
  const arrivalMemo = activeMemos.find((memo) => memo.id === 1);
  const shownArrivalMemo = arrivalTarget ?? arrivalMemo;

  // 위치 감지 및 푸시 알림 (파비콘 포함)
  useEffect(() => {
    if (!navigator.geolocation || activeMemos.length === 0) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const nearbyMemo = activeMemos.find((memo) => {
          if (memo.done || notifiedMemoIdsRef.current.has(memo.id)) return false;
          return distanceMeters(position.coords.latitude, position.coords.longitude, memo.lat, memo.lng) <= memo.radius;
        });

        if (!nearbyMemo) return;
        notifiedMemoIdsRef.current.add(nearbyMemo.id);
        setArrivalTarget(nearbyMemo);
        setArrivalOpen(true);

        if ("Notification" in window && window.Notification.permission === "granted") {
          try {
            new window.Notification(`휘리릭 ·${nearbyMemo.place} 근처에 도착했어요!`, {
              body: nearbyMemo.content || "이 장소에 남겨둔 메모를 확인해보세요.",
              icon: "/favicon.ico", // 파비콘 설정 반영
              tag: `place-memo-${nearbyMemo.id}`,
            });
          } catch {
            // 모바일 브라우저 예외 처리
          }
        }
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [activeMemos]);

  const handleTabChange = (nextTab: Tab) => {
    setTab(nextTab);
    if (nextTab === "home" && mapInstanceRef.current && window.naver?.maps) {
      setTimeout(() => {
        if (isDebugLocation) {
          mapInstanceRef.current.panTo(new window.naver.maps.LatLng(TEST_LAT, TEST_LNG));
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const myLatLng = new window.naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
              mapInstanceRef.current.panTo(myLatLng);
            },
            () => {
              mapInstanceRef.current.panTo(new window.naver.maps.LatLng(37.5051, 126.9571));
            }
          );
        } else {
          mapInstanceRef.current.panTo(new window.naver.maps.LatLng(37.5051, 126.9571));
        }
      }, 100);
    }
  };

  return (
    <main 
      onClick={handleSecretTap} 
      className="h-full w-full overflow-hidden bg-background select-none" 
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      <section className="relative h-full w-full overflow-hidden bg-background">
        <AnimatePresence mode="wait">
          {tab === "home" && (
            <HomeScreen 
              key="home" 
              memos={activeMemos} 
              selected={selected} 
              onSelect={setSelected} 
              onComposeCurrent={openComposerWithCurrentLocation}
              onComposePlace={openComposerWithPlace}
              mapInstanceRef={mapInstanceRef} 
              isDebugLocation={isDebugLocation} 
            />
          )}
          {tab === "family" && <FamilyScreen key="family" memos={familyMemos} setTab={handleTabChange} onSelect={(memo) => { setSelected(memo); handleTabChange("home"); }} />}
          {tab === "archive" && <ArchiveScreen key="archive" memos={archivedMemos} setTab={handleTabChange} onSelect={setSelected} onRequestDelete={setDeleteTarget} />}
          {tab === "my" && <MyScreen key="my" memos={activeMemos} setTab={handleTabChange} myMemosOpen={myMemosOpen} setMyMemosOpen={setMyMemosOpen} onSelect={setSelected} onRequestDelete={setDeleteTarget} />}
        </AnimatePresence>

        {tab === "home" && !selected && arrivalMemo && <button onClick={(e) => { e.stopPropagation(); setArrivalTarget(arrivalMemo); setArrivalOpen(true); if ("Notification" in window && window.Notification.permission === "default") void window.Notification.requestPermission(); }} className="absolute right-5 top-[92px] z-20 flex size-12 items-center justify-center rounded-2xl border border-border bg-white text-primary shadow-[0_10px_30px_rgba(30,40,70,0.16)]" aria-label="도착 알림 미리보기"><BellRing size={20} /></button>}
        {tab === "home" && <BottomNav tab={tab} setTab={handleTabChange} />}

        <AnimatePresence>{selected && <MemoDetail memo={selected} onClose={() => setSelected(null)} onComplete={() => complete(selected)} onArchive={() => archiveMemo(selected)} onRequestDelete={() => setDeleteTarget(selected)} />}</AnimatePresence>
        <AnimatePresence>{composerOpen && <Composer place={place} selectedPlace={selectedPlace} content={content} shared={shared} radius={radius} setPlace={setPlace} setSelectedPlace={setSelectedPlace} setContent={setContent} setShared={setShared} setRadius={setRadius} onClose={() => { setComposerOpen(false); setShared(false); }} onSave={(imgs, cover, sharedWith) => saveMemo(imgs, cover, sharedWith)} />}</AnimatePresence>
        <AnimatePresence>{arrivalOpen && tab === "home" && shownArrivalMemo && <ArrivalCard memo={shownArrivalMemo} onLater={() => { setArrivalOpen(false); setArrivalTarget(null); }} onCheck={() => { updateMemo(shownArrivalMemo.id, { seen: true }); setArrivalOpen(false); setArrivalTarget(null); setSelected({ ...shownArrivalMemo, seen: true }); }} />}</AnimatePresence>
        <AnimatePresence>{deleteTarget && <DeleteMemoDialog memo={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={() => deleteMemo(deleteTarget)} />}</AnimatePresence>
        <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }} className="absolute bottom-24 left-1/2 z-[80] -translate-x-1/2 whitespace-nowrap rounded-full bg-[#171a21] px-4 py-3 text-[13px] font-medium text-white shadow-xl">{toast}</motion.div>}</AnimatePresence>
        <AnimatePresence>{doneBurst && <motion.div initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0, scale: 1.7 }} className="pointer-events-none absolute inset-0 z-[90] flex items-center justify-center bg-white/30 backdrop-blur-[1px]"><div className="flex size-24 items-center justify-center rounded-full bg-primary text-white shadow-[0_18px_35px_rgba(0,196,184,0.35)]"><Check size={52} strokeWidth={3} /></div></motion.div>}</AnimatePresence>
      </section>
    </main>
  );
}

function HomeScreen({ 
  memos, 
  onSelect, 
  onComposeCurrent,
  onComposePlace,
  mapInstanceRef, 
  isDebugLocation 
}: { 
  memos: Memo[]; 
  selected: Memo | null; 
  onSelect: (m: Memo) => void; 
  onComposeCurrent: () => void;
  onComposePlace: (place: NaverPlace) => void;
  mapInstanceRef: React.MutableRefObject<any>; 
  isDebugLocation: boolean 
}) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [memoTrayOpen, setMemoTrayOpen] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  const [searchedPlaceCard, setSearchedPlaceCard] = useState<NaverPlace | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const searchedMarkerRef = useRef<any>(null);

  const q = query.trim().toLowerCase();
  
  const matchedMemos = q ? memos.filter((m) => m.place.toLowerCase().includes(q) || m.content.toLowerCase().includes(q) || (m.address && m.address.toLowerCase().includes(q))) : [];
  const matchedPlaces = q ? MOCK_PLACES.filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.roadAddress.toLowerCase().includes(q)) : [];

  const nearby = memos.find((memo) => !memo.done) ?? memos[0];

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

  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    if (!mapInstanceRef.current || mapInstanceRef.current._hwiririkContainer !== mapRef.current) {
      const initialCenter = isDebugLocation 
        ? new window.naver.maps.LatLng(TEST_LAT, TEST_LNG) 
        : new window.naver.maps.LatLng(37.5051, 126.9571);

      const mapOptions = {
        center: initialCenter,
        zoom: 16,
        zoomControl: false,
      };
      mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current._hwiririkContainer = mapRef.current;
    }

    const map = mapInstanceRef.current;

    const renderMyLocation = (lat: number, lng: number) => {
      const myLatLng = new window.naver.maps.LatLng(lat, lng);
      if (!map._myLocationMarker) {
        map._myLocationMarker = new window.naver.maps.Marker({
          position: myLatLng,
          map: map,
          icon: {
            content: `
              <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">
                <span style="position: absolute; width: 48px; height: 48px; border-radius: 50%; border: 1px solid rgba(0,196,184,0.3); background-color: rgba(0,196,184,0.15); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
                <span style="width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; background-color: #00C4B8; box-shadow: 0 4px 6px rgba(0,0,0,0.15);"></span>
              </div>
            `,
            anchor: new window.naver.maps.Point(24, 24),
          },
        });
      } else {
        map._myLocationMarker.setPosition(myLatLng);
      }
      if (memos.length === 0) map.panTo(myLatLng);
    };

    if (isDebugLocation) {
      renderMyLocation(TEST_LAT, TEST_LNG);
    } else if (navigator.geolocation && !map._myLocationMarker) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          renderMyLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("위치 권한을 불러올 수 없습니다:", error);
        }
      );
    }

    // 부착된 모든 메모 핀 지도상에 렌더링
    const markers = memos.map((memo) => {
      const bgClass = memo.done ? "bg-[#e8eaef] grayscale" : memo.shared ? "bg-white" : "bg-[#e0f9f7]";
      const innerContent = memo.coverImage
        ? `<img src="${memo.coverImage}" class="size-full object-cover rounded-2xl" />`
        : memo.done ? "✓" : `<span style="font-size:16px; font-weight:bold;">${memo.emoji}</span>`;

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
        setSearchedPlaceCard(null);
        onSelect(memo);
      });

      return marker;
    });

    return () => {
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [isMapLoaded, memos, isDebugLocation]);

  const handleSelectPlaceMock = (place: NaverPlace) => {
    setSearchOpen(false);
    setQuery("");
    setSearchedPlaceCard(place);

    if (mapInstanceRef.current && window.naver?.maps && place.lat && place.lng) {
      const targetLatLng = new window.naver.maps.LatLng(place.lat, place.lng);
      mapInstanceRef.current.panTo(targetLatLng);

      if (searchedMarkerRef.current) {
        searchedMarkerRef.current.setMap(null);
      }

      searchedMarkerRef.current = new window.naver.maps.Marker({
        position: targetLatLng,
        map: mapInstanceRef.current,
        icon: {
          content: `
            <div style="transform: translate(-50%, -100%); cursor: pointer;">
              <div class="flex size-11 items-center justify-center rounded-2xl border-2 border-white bg-primary text-white shadow-lg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </div>
            </div>
          `,
          anchor: new window.naver.maps.Point(0, 0),
        },
      });
    }
  };

  const closeSearchedCard = () => {
    setSearchedPlaceCard(null);
    if (searchedMarkerRef.current) {
      searchedMarkerRef.current.setMap(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-full overflow-hidden bg-[#f8f9fa]">
      <div id="map" ref={mapRef} className="h-full w-full" onClick={closeSearchedCard} />

      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-sm text-gray-500">
          지도를 불러오는 중입니다...
        </div>
      )}

      {/* 상단 검색바 */}
      <div className="absolute left-4 right-4 top-[20px] z-20" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-12 items-center gap-2 rounded-[17px] border border-[#e7eaf1] bg-white px-4 shadow-[0_10px_30px_rgba(30,40,70,.16)]">
          <Search size={18} className="text-muted-foreground" />
          <input
            value={query}
            onFocus={() => setSearchOpen(true)}
            onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }}
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#757575]"
            placeholder="장소 및 메모 검색"
          />
          <button onClick={() => { setQuery(""); setSearchOpen(false); }} className={query || searchOpen ? "text-muted-foreground" : "hidden"}>
            <X size={16} />
          </button>
        </div>
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-2 max-h-[60vh] overflow-y-auto rounded-[18px] border border-[#e7eaf1] bg-white shadow-[0_12px_30px_rgba(30,40,70,.14)]">
              <div className="p-2">
                {matchedMemos.length > 0 && (
                  <div className="mb-2">
                    <p className="px-3 pb-1 pt-2 text-[11px] font-bold text-primary">내 메모 목록 ({matchedMemos.length})</p>
                    {matchedMemos.map((memo) => (
                      <button key={memo.id} onClick={() => { setSearchOpen(false); setQuery(""); setSearchedPlaceCard(null); onSelect(memo); }} className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left hover:bg-[#fafbfe]">
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#f3f4f8] text-base">{memo.emoji}</span>
                        <span className="min-w-0">
                          <b className="block truncate text-[13px] font-bold">{memo.place}</b>
                          <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">{memo.content}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {matchedPlaces.length > 0 && (
                  <div>
                    <p className="px-3 pb-1 pt-2 text-[11px] font-bold text-muted-foreground">장소 목록 ({matchedPlaces.length})</p>
                    {matchedPlaces.map((place, index) => (
                      <button key={`${place.title}-${index}`} onClick={() => handleSelectPlaceMock(place)} className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left hover:bg-[#fafbfe]">
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#e0f9f7] text-primary"><MapPin size={16} /></span>
                        <span className="min-w-0">
                          <b className="block truncate text-[13px] font-bold">{place.title}</b>
                          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{place.category} · {place.roadAddress}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {q && matchedMemos.length === 0 && matchedPlaces.length === 0 && (
                  <p className="px-4 py-4 text-center text-[12px] text-muted-foreground">일치하는 장소나 메모가 없어요</p>
                )}
                {!q && (
                  <p className="px-4 py-3 text-center text-[12px] text-muted-foreground">장소명이나 작성한 메모 내용을 입력해 보세요</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 플로팅 + 버튼 */}
      <button onClick={(e) => { e.stopPropagation(); onComposeCurrent(); }} className="absolute bottom-[112px] right-[18px] z-10 flex size-[58px] items-center justify-center rounded-[29px] bg-primary text-white shadow-[0_14px_15px_rgba(0,196,184,.35)]">
        <Plus size={28} />
      </button>

      {/* 검색 장소 정보 카드 */}
      <AnimatePresence>
        {searchedPlaceCard && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-[96px] left-4 right-4 z-30 rounded-[22px] border border-white bg-white/95 p-4 shadow-[0_15px_35px_rgba(30,40,70,.18)] backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[#e0f9f7] text-primary">
                  <MapPin size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">{searchedPlaceCard.title}</h3>
                    <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{searchedPlaceCard.category}</span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{searchedPlaceCard.roadAddress || searchedPlaceCard.address}</p>
                </div>
              </div>
              <button onClick={closeSearchedCard} className="flex size-7 items-center justify-center rounded-full bg-gray-100 text-muted-foreground">
                <X size={15} />
              </button>
            </div>

            <button
              onClick={() => {
                const target = searchedPlaceCard;
                closeSearchedCard();
                onComposePlace(target);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md active:scale-[0.99]"
            >
              <Plus size={18} /> 이 장소에 메모를 작성할까요?
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 메모 트레이 */}
      {!searchedPlaceCard && (
        <div className="absolute bottom-[91px] left-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
          <AnimatePresence mode="wait">
            {memoTrayOpen && nearby ? (
              <motion.button key="expanded" initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 28, opacity: 0 }} onClick={() => onSelect(nearby)} className="w-full rounded-[20px] border border-white/80 bg-white/95 p-3 text-left shadow-[0_10px_30px_rgba(30,40,70,.12)] backdrop-blur">
                <div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-bold text-primary">가까운 메모 · 120m</span><span onClick={(event) => { event.stopPropagation(); setMemoTrayOpen(false); }} className="rounded-lg bg-[#f3f4f8] px-2 py-1 text-[10px] text-muted-foreground">내리기</span></div>
                <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-[#e0f9f7]">{nearby.emoji}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-foreground">{nearby.place}</p><p className="truncate text-[12px] text-muted-foreground">{nearby.author} · {nearby.content}</p></div><MapPin size={18} className="text-primary" /></div>
              </motion.button>
            ) : (
              <motion.button key="collapsed" initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 0, opacity: 1 }} onClick={() => setMemoTrayOpen(true)} className="mx-auto flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-4 py-3 text-[12px] font-bold text-foreground shadow-[0_10px_30px_rgba(30,40,70,.12)] backdrop-blur">
                <MapPin size={15} className="text-primary" />메모 보기 <span className="rounded-full bg-[#e0f9f7] px-1.5 py-0.5 text-[10px] text-primary">{memos.length}</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

function BottomNav({ tab, setTab }: { tab: Tab; setTab: (tab: Tab) => void }) {
  const items: { id: Tab; label: string; icon: typeof Home }[] = [{ id: "home", label: "홈", icon: Home }, { id: "family", label: "모임", icon: UsersRound }, { id: "archive", label: "보관함", icon: Archive }, { id: "my", label: "마이", icon: UserRound }];
  return <nav className="absolute bottom-0 z-40 flex h-[82px] w-full border-t border-[#edf0f5] bg-white px-5 pb-3 pt-2" onClick={(e) => e.stopPropagation()}>{items.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`flex flex-1 flex-col items-center gap-1 text-[10px] font-medium ${tab === id ? "text-primary" : "text-[#9aa0ae]"}`}><span className={`flex size-8 items-center justify-center rounded-xl ${tab === id ? "bg-[#e0f9f7]" : ""}`}><Icon size={19} strokeWidth={tab === id ? 2.6 : 1.9} /></span>{label}</button>)}</nav>;
}

function MemoDetail({ memo, onClose, onComplete, onArchive, onRequestDelete }: { memo: Memo; onClose: () => void; onComplete: () => void; onArchive: () => void; onRequestDelete: () => void }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  return (
    <motion.section initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }} className="absolute inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-white px-5 pb-8 pt-3 shadow-[0_-18px_42px_rgba(31,39,74,.18)]" onClick={(e) => e.stopPropagation()}>
      <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-[#d9dce5]" />
      <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
        <div className="min-w-0"><p className="text-[12px] font-semibold text-primary">{memo.archived ? "보관된 장소 메모" : "장소 메모"}</p><h2 className="mt-0.5 truncate text-[19px] font-bold">{memo.place}</h2>{memo.address && <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{memo.address}</p>}</div>
        <button onClick={onClose} className="flex size-9 items-center justify-center rounded-full bg-[#f3f4f8]"><X size={18} /></button>
      </div>
      {memo.coverImage && (
        <button onClick={() => setLightbox(memo.coverImage!)} className="mb-4 block w-full overflow-hidden rounded-[16px]">
          <img src={memo.coverImage} className="h-[180px] w-full object-cover" />
        </button>
      )}
      <div className="rounded-[18px] bg-[#fafbfe] p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-[14px] bg-[#e0f9f7] text-xl">{memo.emoji}</div>
          <div>
            <p className="text-[13px] text-muted-foreground">{memo.author === "나" ? "내가 남긴 메모" : `${memo.author}가 남긴 심부름`}</p>
            <p className="text-[12px] text-muted-foreground">도착 알림 · 반경 {memo.radius}m</p>
          </div>
        </div>
        {memo.content && (
          <p className={`text-[16px] leading-7 ${memo.done ? "text-[#a7acb7] line-through" : "font-medium text-foreground"}`}>{memo.content}</p>
        )}
      </div>
      <div className={`mt-3 rounded-[14px] px-3.5 py-3 ${memo.archived ? "bg-[#eafbf9]" : "bg-amber-50"}`}>
        <p className={`flex items-center gap-1.5 text-[12px] font-bold ${memo.archived ? "text-primary" : "text-amber-700"}`}>{memo.archived ? <Archive size={14} /> : <Clock3 size={14} />}{memo.archived ? "보관함에 안전하게 저장됐어요" : `${formatRemaining(memo.expiresAt)} · 이후 자동으로 사라져요`}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">{memo.archived ? "지도에서는 24시간 후 사라지지만 보관함에서는 계속 볼 수 있어요." : "기억하고 싶다면 아래에서 보관함에 저장해주세요."}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-[14px] border border-[#eef0f4] bg-white p-3 text-[11px]">
        <div><p className="text-muted-foreground">작성자</p><p className="mt-0.5 font-bold">{memo.author}</p></div>
        <div><p className="text-muted-foreground">작성일</p><p className="mt-0.5 font-bold">{formatDate(memo.createdAt)}</p></div>
        <div><p className="text-muted-foreground">완료일</p><p className="mt-0.5 font-bold">{memo.completedAt ? formatDate(memo.completedAt) : "아직 완료 전"}</p></div>
        <div><p className="text-muted-foreground">완료한 사람</p><p className="mt-0.5 font-bold">{memo.completedBy ?? "—"}</p></div>
        {memo.shared && <div className="col-span-2 border-t border-[#eef0f4] pt-2"><p className="text-muted-foreground">공유 대상</p><p className="mt-0.5 font-bold text-primary">{memo.sharedWith && memo.sharedWith.length > 0 ? memo.sharedWith.join(" · ") : "모임 전체"}</p></div>}
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
      {memo.seen && !memo.done && <p className="mt-3 rounded-xl bg-[#e0f9f7] px-3 py-2 text-[12px] font-medium text-primary">✓ 도착 메모를 확인했어요</p>}
      {memo.done && <p className="mt-3 rounded-xl bg-[#f0f2f5] px-3 py-2 text-[12px] font-medium text-[#7b8290]">{memo.completedBy ?? "김뽀꾸"}님이 심부름을 완료했어요</p>}
      <button disabled={memo.archived} onClick={onArchive} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] border py-3.5 text-sm font-bold ${memo.archived ? "border-primary/20 bg-[#eafbf9] text-primary" : "border-primary bg-white text-primary"}`}><Archive size={17} />{memo.archived ? "보관함에 저장됨" : "보관함에 저장"}{memo.archived && <Check size={15} />}</button>
      {memo.author === "나" && <button onClick={onRequestDelete} className="mt-2 flex w-full items-center justify-center gap-2 rounded-[14px] border border-rose-200 bg-rose-50 py-3.5 text-sm font-bold text-rose-500"><Trash2 size={17} />내 메모 삭제</button>}
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

function SelectedPlaceMap({ place }: { place: NaverPlace }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;

    const createMap = () => {
      if (cancelled) return;

      if (!mapRef.current || !window.naver?.maps) {
        attempts += 1;
        if (attempts >= 50) {
          setMapStatus("error");
          return;
        }
        timer = window.setTimeout(createMap, 100);
        return;
      }

      const center = new window.naver.maps.LatLng(place.lat ?? 37.5051, place.lng ?? 126.9571);
      const map = new window.naver.maps.Map(mapRef.current, {
        center,
        zoom: 17,
        zoomControl: false,
        draggable: false,
        scrollWheel: false,
        pinchZoom: false,
        keyboardShortcuts: false,
        disableDoubleTapZoom: true,
        disableDoubleClickZoom: true,
        disableTwoFingerTapZoom: true,
      });

      setMapStatus("ready");
      timer = window.setTimeout(() => {
        if (!cancelled) window.naver.maps.Event.trigger(map, "resize");
      }, 80);
    };

    timer = window.setTimeout(createMap, 20);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [place.lat, place.lng]);

  return (
    <div className="absolute inset-0">
      <div ref={mapRef} className="h-full w-full" aria-label={`${place.title} 지도`} />
      {mapStatus === "loading" && <div className="absolute inset-0 flex items-center justify-center bg-[#f3f5f7] text-[11px] text-muted-foreground">지도를 불러오는 중이에요...</div>}
      {mapStatus === "error" && <div className="absolute inset-0 flex items-center justify-center bg-[#f3f5f7] text-[11px] text-muted-foreground">지도를 불러오지 못했어요</div>}
      {mapStatus === "ready" && <span className="pointer-events-none absolute left-1/2 top-[52%] flex size-9 -translate-x-1/2 -translate-y-full items-center justify-center rounded-2xl border-2 border-white bg-primary text-white shadow-lg"><MapPin size={17} fill="currentColor" /></span>}
    </div>
  );
}

function Composer(props: { place: string; selectedPlace: NaverPlace | null; content: string; shared: boolean; radius: number; setPlace: (v: string) => void; setSelectedPlace: (v: NaverPlace | null) => void; setContent: (v: string) => void; setShared: (v: boolean) => void; setRadius: (v: number) => void; onClose: () => void; onSave: (images: string[], coverImage: string, sharedWith: FamilyMember[]) => void }) {
  const [images, setImages] = useState<string[]>([]);
  const [coverIdx, setCoverIdx] = useState<number>(0);
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [sharePickerOpen, setSharePickerOpen] = useState(false);
  const [sharedWith, setSharedWith] = useState<FamilyMember[]>([]);
  const [shareDraft, setShareDraft] = useState<FamilyMember[]>([]);
  const [placeQuery, setPlaceQuery] = useState(props.place);
  const [placeSearchOpen, setPlaceSearchOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState("현재 위치를 켜면 가까운 장소부터 볼 수 있어요");
  const galleryRef = React.useRef<HTMLInputElement>(null);
  const cameraRef = React.useRef<HTMLInputElement>(null);
  const { places: placeResults, loading: placeLoading } = useNaverPlaceSearch(placeQuery);

  const visiblePlaces = (placeQuery.trim() ? placeResults : MOCK_PLACES)
    .map((place) => ({
      ...place,
      distance: currentLocation ? distanceMeters(currentLocation.lat, currentLocation.lng, place.lat, place.lng) : place.distance,
    }))
    .sort((a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY));

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("이 기기에서는 현재 위치를 사용할 수 없어요");
      return;
    }
    setLocationStatus("현재 위치를 확인하고 있어요...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus("현재 위치에서 가까운 순서로 보여드려요");
        setPlaceSearchOpen(true);
      },
      () => setLocationStatus("위치 권한을 허용하면 가까운 장소부터 볼 수 있어요"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const choosePlace = (place: NaverPlace) => {
    props.setPlace(place.title);
    props.setSelectedPlace(place);
    setPlaceQuery(place.title);
    setPlaceSearchOpen(false);
  };

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

  const toggleShareMember = (member: FamilyMember) => {
    setShareDraft((members) => members.includes(member) ? members.filter((name) => name !== member) : [...members, member]);
  };

  const openSharePicker = () => {
    setShareDraft(sharedWith);
    props.setShared(true);
    setSharePickerOpen(true);
  };

  const closeSharePicker = () => {
    setShareDraft(sharedWith);
    setSharePickerOpen(false);
    if (sharedWith.length === 0) props.setShared(false);
  };

  const canSave = props.place.trim() && (props.content.trim() || images.length > 0) && (!props.shared || sharedWith.length > 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[70] bg-[#171a21]/25 backdrop-blur-[1px]" onClick={(e) => e.stopPropagation()}>
      <AnimatePresence>
        {photoPickerOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPhotoPickerOpen(false)} className="absolute inset-0 z-[80] flex items-end justify-center pb-6">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 320 }} onClick={(e) => e.stopPropagation()} className="mx-4 w-full max-w-sm overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_rgba(20,20,50,.22)]">
              <p className="border-b border-[#f0f1f5] px-5 py-4 text-center text-[13px] font-semibold text-muted-foreground">사진 추가 방법 선택</p>
              <button onClick={handleCameraClick} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[#fafbfe] active:bg-[#f3f4f8]">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-[#e0f9f7] text-primary"><Camera size={20} /></span>
                <div><p className="text-[15px] font-bold">사진 촬영</p><p className="text-[12px] text-muted-foreground">카메라로 바로 찍기</p></div>
              </button>
              <div className="mx-5 border-t border-[#f0f1f5]" />
              <button onClick={() => { setPhotoPickerOpen(false); galleryRef.current?.click(); }} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[#fafbfe] active:bg-[#f3f4f8]">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-[#e0f9f7] text-primary"><Image size={20} /></span>
                <div><p className="text-[15px] font-bold">사진 첨부</p><p className="text-[12px] text-muted-foreground">갤러리에서 선택</p></div>
              </button>
              <div className="px-4 pb-4 pt-2">
                <button onClick={() => setPhotoPickerOpen(false)} className="w-full rounded-[14px] bg-[#f3f4f8] py-3 text-[14px] font-bold text-[#5f6674]">취소</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
      <AnimatePresence>
        {sharePickerOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeSharePicker} className="absolute inset-0 z-[85] flex items-center justify-center bg-black/35 px-6">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 12 }} transition={{ type: "spring", damping: 25, stiffness: 340 }} onClick={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-[22px] bg-white p-6 shadow-[0_20px_55px_rgba(20,20,50,.24)]">
              <div className="text-center"><span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#e0f9f7] text-primary"><UsersRound size={26} /></span><h3 className="mt-4 text-[18px] font-bold">누구와 공유할까요?</h3><p className="mt-1 text-[12px] text-muted-foreground">엄마, 아빠, 언니 중 함께 볼 사람을 선택해 주세요.</p></div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {(["엄마", "아빠", "언니"] as FamilyMember[]).map((member) => {
                  const isSelected = shareDraft.includes(member);
                  return <button type="button" key={member} onClick={() => toggleShareMember(member)} className={`relative flex flex-col items-center gap-2 rounded-[16px] border py-4 text-[14px] font-bold transition-colors ${isSelected ? "border-primary bg-[#e0f9f7] text-primary" : "border-border bg-white text-foreground"}`}>
                    <span className={`flex size-11 items-center justify-center rounded-2xl text-[15px] ${member === "엄마" ? "bg-rose-100 text-rose-500" : member === "아빠" ? "bg-sky-100 text-sky-600" : "bg-violet-100 text-violet-600"}`}>{member.slice(0, 1)}</span>
                    {member}
                    {isSelected && <span className="absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-white"><Check size={12} strokeWidth={3} /></span>}
                  </button>;
                })}
              </div>
              <div className="mt-5 flex gap-2"><button type="button" onClick={closeSharePicker} className="flex-1 rounded-[13px] border border-border py-3 text-[13px] font-bold text-[#5f6674]">취소</button><button type="button" disabled={shareDraft.length === 0} onClick={() => { setSharedWith(shareDraft); props.setShared(true); setSharePickerOpen(false); }} className="flex-1 rounded-[13px] bg-primary py-3 text-[13px] font-bold text-white disabled:bg-[#7eeae6]">선택 완료</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
      <motion.section initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 29, stiffness: 300 }} className="absolute inset-x-0 bottom-0 flex max-h-[90vh] flex-col rounded-t-[28px] bg-white px-5 pb-8 pt-3">
        <div className="mx-auto mb-4 h-1.5 w-11 shrink-0 rounded-full bg-[#d9dce5]" />
        <div className="mb-5 flex shrink-0 items-center justify-between">
          <div><p className="text-[12px] font-semibold text-primary">새로운 장소 메모</p><h2 className="text-xl font-bold">어디에 붙일까요?</h2></div>
          <button onClick={props.onClose} className="flex size-9 items-center justify-center rounded-full bg-[#f3f4f8]"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[13px] font-bold">장소 검색</p>
                <button type="button" onClick={requestCurrentLocation} className="flex items-center gap-1 rounded-full bg-[#e0f9f7] px-2.5 py-1.5 text-[10px] font-bold text-primary"><LocateFixed size={12} />내 위치</button>
              </div>
              <div className={`flex h-12 items-center gap-2 rounded-[13px] border bg-[#fafbfe] px-3 ${placeSearchOpen ? "border-primary" : "border-border"}`}>
                <Search size={16} className="shrink-0 text-muted-foreground" />
                <input
                  value={placeQuery}
                  onFocus={() => setPlaceSearchOpen(true)}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPlaceQuery(value);
                    props.setPlace(value);
                    props.setSelectedPlace(null);
                    setPlaceSearchOpen(true);
                  }}
                  placeholder="예: 다이소, 중앙약국"
                  className="w-full bg-transparent text-sm font-normal outline-none"
                />
                {(placeQuery || placeSearchOpen) && <button type="button" onClick={() => { setPlaceQuery(""); props.setPlace(""); props.setSelectedPlace(null); setPlaceSearchOpen(false); }} className="text-muted-foreground"><X size={15} /></button>}
              </div>
              <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground"><LocateFixed size={11} className={currentLocation ? "text-primary" : ""} />{locationStatus}</p>

              <AnimatePresence>
                {placeSearchOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-2 max-h-[190px] overflow-y-auto rounded-[14px] border border-[#e7eaf1] bg-white shadow-[0_8px_22px_rgba(30,40,70,.10)]">
                    {placeLoading && placeQuery.trim() && <p className="px-4 py-4 text-center text-[12px] text-muted-foreground">장소를 검색하고 있어요...</p>}
                    {!placeLoading && visiblePlaces.length === 0 && <p className="px-4 py-4 text-center text-[12px] text-muted-foreground">검색 결과가 없어요</p>}
                    {(!placeLoading || !placeQuery.trim()) && visiblePlaces.map((place, index) => (
                      <button type="button" key={`${place.title}-${index}`} onClick={() => choosePlace(place)} className="flex w-full items-center gap-3 border-b border-[#f0f1f5] px-3 py-2.5 text-left last:border-b-0 hover:bg-[#fafbfe]">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#e0f9f7] text-primary"><MapPin size={16} /></span>
                        <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><b className="truncate text-[13px]">{place.title}</b><em className="shrink-0 text-[10px] not-italic text-primary">{formatDistance(place.distance)}</em></span><span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{place.category} · {place.roadAddress}</span></span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {props.selectedPlace && !placeSearchOpen && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="relative mt-2 h-[118px] overflow-hidden rounded-[14px] border border-primary/20 bg-[#f8f9fa]">
                  <SelectedPlaceMap place={props.selectedPlace} />
                  <div className="absolute inset-x-2 bottom-2 flex items-center gap-2 rounded-[11px] bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
                    <span className="min-w-0 flex-1"><b className="block truncate text-[12px]">{props.selectedPlace.title}</b><span className="block truncate text-[9px] text-muted-foreground">{props.selectedPlace.roadAddress || props.selectedPlace.address}</span></span>
                    <button type="button" onClick={() => setPlaceSearchOpen(true)} className="shrink-0 rounded-lg bg-[#e0f9f7] px-2 py-1 text-[10px] font-bold text-primary">장소 변경</button>
                  </div>
                </motion.div>
              )}
            </div>
            <div>
              <p className="mb-1.5 text-[13px] font-bold">
                메모 내용 {images.length > 0 && <span className="font-normal text-muted-foreground">(선택)</span>}
              </p>
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
                <button onClick={() => { props.setShared(false); setSharedWith([]); setShareDraft([]); }} className={`rounded-[10px] py-2.5 text-[13px] font-bold ${!props.shared ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>나만 보기</button>
                <button onClick={openSharePicker} className={`rounded-[10px] py-2.5 text-[13px] font-bold ${props.shared ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>모임 공유</button>
              </div>
              {props.shared && sharedWith.length > 0 && <button type="button" onClick={openSharePicker} className="mt-2 flex w-full items-center justify-between rounded-[12px] border border-primary/20 bg-[#f3fcfb] px-3 py-2.5 text-left"><span className="text-[11px] text-muted-foreground">공유 대상</span><span className="flex items-center gap-1.5 text-[12px] font-bold text-primary">{sharedWith.join(" · ")}<ChevronLeft size={14} className="rotate-180" /></span></button>}
            </div>
            <div>
              <p className="mb-2 text-[13px] font-bold">도착 알림 반경</p>
              <div className="flex gap-2">{[50, 100, 300].map((v) => <button key={v} onClick={() => props.setRadius(v)} className={`flex-1 rounded-xl border py-2 text-[12px] font-bold ${props.radius === v ? "border-primary bg-[#e0f9f7] text-primary" : "border-border text-muted-foreground"}`}>{v}m</button>)}</div>
              <p className="mt-2 flex items-start gap-1 text-[10px] leading-4 text-muted-foreground"><BellRing size={11} className="mt-0.5 shrink-0 text-primary" />메모를 저장할 때 알림 권한을 허용하면, 앱을 사용하는 동안 이 거리 안에서 알림센터로 알려드려요.</p>
            </div>
          </div>
        </div>
        <button disabled={!canSave} onClick={() => props.onSave(images, images[coverIdx] ?? "", sharedWith)} className="mt-4 w-full shrink-0 rounded-[15px] bg-primary py-3.5 text-sm font-bold text-white disabled:bg-[#7eeae6]">메모 붙이기</button>
      </motion.section>
    </motion.div>
  );
}

// 근처 도착 알림 카드 (파비콘 아이콘 노출 반영)
function ArrivalCard({ memo, onLater, onCheck }: { memo: Memo; onLater: () => void; onCheck: () => void }) {
  return (
    <motion.section initial={{ y: 160, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 160, opacity: 0 }} transition={{ type: "spring", damping: 23, stiffness: 320 }} className="absolute inset-x-4 bottom-[96px] z-[35] rounded-[22px] border border-white bg-white p-4 shadow-[0_18px_45px_rgba(39,39,74,.20)]" onClick={(e) => e.stopPropagation()}>
      <div className="mb-3 flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#e0f9f7] p-2">
          <img src="/favicon.ico" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} className="size-6 object-contain" alt="파비콘" />
        </div>
        <div><p className="text-[16px] font-bold">{memo.place} 근처에 도착했어요!</p><p className="mt-1 text-[12px] leading-5 text-muted-foreground">{memo.author}가 남긴 심부름 — {memo.content}</p></div>
      </div>
      <div className="flex gap-2"><button onClick={onLater} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#f3f4f8] py-2.5 text-[12px] font-bold text-[#697080]"><X size={15} /> 나중에 보기</button><button onClick={onCheck} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-[12px] font-bold text-white"><Check size={15} /> 확인했어요</button></div>
    </motion.section>
  );
}

function FamilyScreen({ memos, onSelect, setTab }: { memos: Memo[]; onSelect: (m: Memo) => void; setTab: (tab: Tab) => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="h-full overflow-y-auto bg-[#f7f8fb] px-5 pb-28 pt-[61px]" onClick={(e) => e.stopPropagation()}>
      <div className="mb-6"><p className="text-[12px] font-bold text-primary">우리 모임의 장소 메모</p><h1 className="mt-1 text-[24px] font-bold">모임 심부름</h1></div>
      <div className="space-y-3">
        {memos.map((memo) => <button onClick={() => onSelect(memo)} key={memo.id} className="w-full rounded-[20px] bg-white p-4 text-left shadow-[0_8px_25px_rgba(30,40,70,.06)]"><div className="flex gap-3"><Avatar name={memo.author} /><div className="min-w-0 flex-1"><div className="flex items-center justify-between"><p className="text-[14px] font-bold">{memo.author}</p><span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock3 size={11} />{formatRemaining(memo.expiresAt)}</span></div><p className="mt-0.5 flex items-center gap-1 text-[12px] text-primary"><MapPin size={12} />{memo.place}</p><p className={`mt-2 text-[14px] leading-5 ${memo.done ? "text-[#a6abb6] line-through" : "text-foreground"}`}>{memo.content}</p>{memo.done && <p className="mt-3 rounded-lg bg-[#f0f2f5] px-2.5 py-2 text-[11px] font-medium text-[#7b8290]">{memo.completedBy ?? "김뽀꾸"}님이 심부름을 완료했어요</p>}</div></div></button>)}
        {!memos.length && <div className="rounded-[20px] bg-white p-5 text-center text-sm text-muted-foreground">지금은 공유된 메모가 없어요.</div>}
      </div>
      <BottomNav tab="family" setTab={setTab} />
    </motion.div>
  );
}

function ArchiveScreen({ memos, setTab, onSelect, onRequestDelete }: { memos: Memo[]; setTab: (tab: Tab) => void; onSelect: (memo: Memo) => void; onRequestDelete: (memo: Memo) => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto bg-[#f7f8fb] px-5 pb-28 pt-[61px]" onClick={(e) => e.stopPropagation()}>
      <p className="text-[12px] font-bold text-primary">24시간 뒤에도 남겨두는 기억</p>
      <h1 className="mt-1 text-[24px] font-bold">보관함</h1>
      <p className="mt-1 text-[11px] text-muted-foreground">보관한 메모는 시간이 지나도 사라지지 않아요.</p>
      <div className="mt-5 space-y-3">
        {memos.map((memo) => (
          <article key={memo.id} className="rounded-[20px] bg-white p-4 shadow-[0_8px_25px_rgba(30,40,70,.06)]">
            <button onClick={() => onSelect(memo)} className="w-full text-left">
              <p className="flex items-center gap-1 text-[13px] font-bold text-primary"><MapPin size={13} />{memo.place}</p>
              {memo.address && <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{memo.address}</p>}
              <p className="mt-2 text-[14px] leading-5 text-foreground">{memo.content || "사진으로 남긴 메모"}</p>
              {memo.images?.length ? <div className="mt-3 flex gap-2 overflow-hidden">{memo.images.slice(0, 3).map((image, index) => <img key={index} src={image} className="size-14 rounded-xl object-cover" />)}</div> : null}
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-[#eef0f4] pt-3 text-[10px]">
                <div><span className="text-muted-foreground">작성자</span><b className="ml-1">{memo.author}</b></div>
                <div><span className="text-muted-foreground">작성일</span><b className="ml-1">{formatDate(memo.createdAt)}</b></div>
                <div><span className="text-muted-foreground">완료일</span><b className="ml-1">{memo.completedAt ? formatDate(memo.completedAt) : "—"}</b></div>
                <div><span className="text-muted-foreground">완료한 사람</span><b className="ml-1">{memo.completedBy ?? "—"}</b></div>
              </div>
            </button>
            {memo.author === "나" && <button onClick={() => onRequestDelete(memo)} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-50 py-2.5 text-[12px] font-bold text-rose-500"><Trash2 size={14} />이 메모 삭제</button>}
          </article>
        ))}
        {!memos.length && <div className="rounded-[20px] bg-white p-5 text-center text-sm text-muted-foreground">아직 보관한 메모가 없어요.</div>}
      </div>
      <BottomNav tab="archive" setTab={setTab} />
    </motion.div>
  );
}

function MyScreen({ memos, setTab, myMemosOpen, setMyMemosOpen, onSelect, onRequestDelete }: { memos: Memo[]; setTab: (tab: Tab) => void; myMemosOpen: boolean; setMyMemosOpen: (value: boolean) => void; onSelect: (memo: Memo) => void; onRequestDelete: (memo: Memo) => void }) {
  const ownMemos = memos.filter((memo) => memo.author === "나");
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto bg-[#f7f8fb] px-5 pb-28 pt-[61px]" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-3"><Avatar name="나" /><div><p className="text-lg font-bold">김뽀꾸님</p><p className="text-[12px] text-muted-foreground">나의 장소 메모 {ownMemos.length}개</p></div></div>
      {myMemosOpen ? (
        <div className="mt-7">
          <button onClick={() => setMyMemosOpen(false)} className="mb-3 flex items-center gap-1 text-[13px] font-bold text-primary"><ChevronLeft size={17} /> 설정으로</button>
          <h2 className="mb-3 text-[19px] font-bold">내 메모 보기</h2>
          <div className="space-y-2">
            {ownMemos.map((memo) => <article key={memo.id} className="flex items-center gap-2 rounded-[17px] bg-white p-3"><button onClick={() => onSelect(memo)} className="min-w-0 flex-1 text-left"><p className="flex items-center gap-1 truncate text-[12px] text-primary"><MapPin size={13} />{memo.place}</p><p className="mt-1 truncate text-[14px] font-medium">{memo.content || "사진으로 남긴 메모"}</p><p className="mt-1 text-[9px] text-muted-foreground">{formatRemaining(memo.expiresAt)}</p></button><button onClick={() => onRequestDelete(memo)} className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500" aria-label="내 메모 삭제"><Trash2 size={16} /></button></article>)}
            {!ownMemos.length && <div className="rounded-[17px] bg-white p-4 text-center text-sm text-muted-foreground">아직 내가 남긴 메모가 없어요.</div>}
          </div>
        </div>
      ) : (
        <div className="mt-7 space-y-3"><button onClick={() => setMyMemosOpen(true)} className="w-full rounded-[18px] bg-white p-4 text-left text-sm font-semibold">내 메모 보기 <MapPin className="float-right text-primary" size={18} /></button><div className="rounded-[18px] bg-white p-4 text-sm font-semibold">알림 설정 <BellRing className="float-right text-primary" size={18} /></div><div className="rounded-[18px] bg-white p-4 text-sm font-semibold">모임 관리 <UsersRound className="float-right text-primary" size={18} /></div></div>
      )}
      <BottomNav tab="my" setTab={setTab} />
    </motion.div>
  );
}

function DeleteMemoDialog({ memo, onCancel, onConfirm }: { memo: Memo; onCancel: () => void; onConfirm: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[110] flex items-center justify-center bg-black/35 px-6 backdrop-blur-[2px]" onClick={(event) => { event.stopPropagation(); onCancel(); }}>
      <motion.div initial={{ scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 12 }} transition={{ type: "spring", damping: 24, stiffness: 340 }} className="w-full max-w-sm rounded-[22px] bg-white p-5 shadow-[0_20px_50px_rgba(20,20,50,.24)]" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex flex-col items-center text-center"><span className="mb-3 flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-500"><Trash2 size={26} /></span><h3 className="text-[18px] font-bold">정말 삭제할까요?</h3><p className="mt-2 text-[12px] leading-5 text-muted-foreground">‘{memo.place}’ 메모가 완전히 사라져요.<br />삭제한 뒤에는 되돌릴 수 없어요.</p></div>
        <div className="flex gap-2"><button onClick={onCancel} className="flex-1 rounded-[13px] border border-border py-3 text-[14px] font-semibold text-[#5f6674]">취소</button><button onClick={onConfirm} className="flex-1 rounded-[13px] bg-rose-500 py-3 text-[14px] font-bold text-white">완전히 삭제</button></div>
      </motion.div>
    </motion.div>
  );
}
