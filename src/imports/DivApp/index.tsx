import imgDivMap from "./9db94bf4b097dba134e80a2bc7fd4238620c3e3a.png";

function DivMap() {
  return <div className="bg-size-[256px_256px,auto_auto] bg-top-left flex-[1_0_0] min-h-px relative w-full" style={{ backgroundImage: `url("${imgDivMap}"), linear-gradient(90deg, rgb(248, 249, 250) 0%, rgb(248, 249, 250) 100%)` }} data-name="div#map" />;
}

function DivPlaceholder() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip pb-[2px] relative shrink-0 w-full" data-name="div#placeholder">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[14px] w-full">
        <p className="leading-[normal]">장소 또는 메모 내용 검색</p>
      </div>
    </div>
  );
}

function InputSearchInput() {
  return (
    <div className="bg-white content-stretch flex flex-[1_0_0] flex-col h-full items-start min-w-px overflow-clip pb-[13px] pt-[15px] px-[14px] relative" data-name="input#searchInput">
      <DivPlaceholder />
    </div>
  );
}

function DivSearch() {
  return (
    <div className="bg-white border border-[#e7eaf1] border-solid content-stretch flex flex-[1_0_0] h-[48px] items-start justify-center min-w-px overflow-clip relative rounded-[17px] shadow-[0px_10px_30px_0px_rgba(30,40,70,0.16)]" data-name="div.search">
      <InputSearchInput />
    </div>
  );
}

function SpanH2DRemoveBefore() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0" data-name="span.__h2d-remove-before">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[22px] text-black text-center whitespace-nowrap">
        <p className="leading-[normal]">◎</p>
      </div>
    </div>
  );
}

function ButtonMyLocationBtn() {
  return (
    <div className="bg-white border border-[#e7eaf1] border-solid content-stretch flex flex-col items-center justify-center overflow-clip pb-[11px] pt-[10px] relative rounded-[17px] shadow-[0px_10px_30px_0px_rgba(30,40,70,0.16)] shrink-0 size-[48px]" data-name="button#myLocationBtn">
      <SpanH2DRemoveBefore />
    </div>
  );
}

function SpanH2DRemoveBefore1() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0" data-name="span.__h2d-remove-before">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[15px] text-black text-center whitespace-nowrap">
        <p className="leading-[normal]">T</p>
      </div>
    </div>
  );
}

function ButtonSimulateBtn() {
  return (
    <div className="bg-white border border-[#e7eaf1] border-solid content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[17px] shadow-[0px_10px_30px_0px_rgba(30,40,70,0.16)] shrink-0 size-[48px]" data-name="button#simulateBtn">
      <SpanH2DRemoveBefore1 />
    </div>
  );
}

function DivMapActions() {
  return (
    <div className="content-stretch flex gap-[7px] items-start relative self-stretch shrink-0" data-name="div.map-actions">
      <ButtonMyLocationBtn />
      <ButtonSimulateBtn />
    </div>
  );
}

function DivTopbar() {
  return (
    <div className="absolute content-stretch flex gap-[8px] items-start left-[14px] right-[14px] top-[54px]" data-name="div.topbar">
      <DivSearch />
      <DivMapActions />
    </div>
  );
}

function DivHint() {
  return (
    <div className="absolute backdrop-blur-[4px] bg-[rgba(23,26,33,0.88)] bottom-[91.59px] content-stretch flex flex-col items-center left-[97.5px] max-w-[1888px] px-[12px] py-[9px] rounded-[999px] w-[195px]" data-name="div.hint">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
        <p className="leading-[16.8px] mb-0">지도를 길게 누르거나 클릭해서</p>
        <p className="leading-[16.8px]">메모 장소를 선택해보세요</p>
      </div>
    </div>
  );
}

function ButtonAddBtn() {
  return (
    <div className="absolute bg-[#6757ff] bottom-[22px] content-stretch drop-shadow-[0px_14px_15px_rgba(103,87,255,0.35)] flex flex-col items-center justify-center pb-[14px] pt-[13px] px-[6px] right-[18px] rounded-[29px] size-[58px]" data-name="button#addBtn">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[28px] text-center text-white whitespace-nowrap">
        <p className="leading-[normal]">＋</p>
      </div>
    </div>
  );
}

function MainPanel() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col inset-0 items-start justify-center overflow-clip" data-name="main.panel">
      <DivMap />
      <DivTopbar />
      <DivHint />
      <ButtonAddBtn />
    </div>
  );
}

function BeforeMargin() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex flex-col h-[14.94px] items-center left-1/2 pt-[10px] px-[174px] top-0 w-[390px]" data-name="::before:margin">
      <div className="bg-[#d9dce5] h-[4.94px] relative rounded-[999px] shrink-0 w-[42px]" data-name="::before" />
    </div>
  );
}

function H2DetailTitle() {
  return (
    <div className="content-stretch flex flex-col items-start py-[2px] relative shrink-0 w-full" data-name="h2#detailTitle">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#171a21] text-[18px] w-full">
        <p className="leading-[normal]">활성 메모</p>
      </div>
    </div>
  );
}

function DivDetailHead() {
  return (
    <div className="absolute border-[#e7eaf1] border-b border-solid content-stretch flex flex-col items-start left-0 min-h-[69px] pb-[32px] pt-[12px] px-[20px] right-0 top-[14.94px]" data-name="div.detail-head">
      <H2DetailTitle />
    </div>
  );
}

function B() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[3px] pt-px relative shrink-0 w-full" data-name="b">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#171a21] text-[16px] w-full">
        <p className="leading-[normal]">🧭 현재 위치 테스트</p>
      </div>
    </div>
  );
}

function DivLocationCard() {
  return (
    <div className="bg-[#fafbfe] border border-[#d5d9e3] border-dashed content-stretch flex flex-col gap-[8px] items-start pb-[16px] pt-[14px] px-[14px] relative rounded-[16px] shrink-0 w-full" data-name="div.location-card">
      <B />
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#707789] text-[13.3px] whitespace-nowrap">
        <p className="leading-[normal]">아직 위치를 확인하지 않았어요.</p>
      </div>
    </div>
  );
}

function DivTypeIcon() {
  return (
    <div className="bg-[#ece9ff] content-stretch flex flex-col items-center justify-center pb-[10.5px] pt-[9.5px] relative rounded-[14px] shrink-0 size-[42px]" data-name="div.type-icon">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#171a21] text-[17px] text-center whitespace-nowrap">
        <p className="leading-[normal]">✅</p>
      </div>
    </div>
  );
}

function DivMemoTitle() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pb-[0.8px] right-0 top-[-1px]" data-name="div.memo-title">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:ExtraBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#171a21] text-[16px] whitespace-nowrap">
        <p className="leading-[20.8px]">중앙대학교 정문</p>
      </div>
    </div>
  );
}

function DivMemoMeta() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[24.8px]" data-name="div.memo-meta">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#707789] text-[12px] whitespace-nowrap">
        <p className="leading-[17.4px]">할 일 · 나 혼자 · 23시간 59분 남음</p>
      </div>
    </div>
  );
}

function Div() {
  return (
    <div className="h-[43.19px] relative shrink-0 w-[181.36px]" data-name="div">
      <DivMemoTitle />
      <DivMemoMeta />
    </div>
  );
}

function DivMemoTop() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="div.memo-top">
      <DivTypeIcon />
      <Div />
    </div>
  );
}

function DivMemoContent() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="div.memo-content">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#171a21] text-[14px] w-full">
        <p className="leading-[23.1px]">학생지원팀에서 증명서 출력하기</p>
      </div>
    </div>
  );
}

function SpanChip() {
  return (
    <div className="bg-[#f3f4f8] content-stretch flex flex-col items-start pb-[7px] pt-[6px] px-[8px] relative rounded-[999px] self-stretch shrink-0" data-name="span.chip">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#646b7b] text-[11px] whitespace-nowrap">
        <p className="leading-[normal]">도착 알림</p>
      </div>
    </div>
  );
}

function SpanChip1() {
  return (
    <div className="bg-[#f3f4f8] content-stretch flex flex-col items-start pb-[7px] pt-[6px] px-[8px] relative rounded-[999px] self-stretch shrink-0" data-name="span.chip">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#646b7b] text-[11px] whitespace-nowrap">
        <p className="leading-[normal]">반경 100m</p>
      </div>
    </div>
  );
}

function DivChips() {
  return (
    <div className="content-stretch flex flex-wrap gap-[0px_6px] h-[27px] items-start pt-px relative shrink-0 w-full" data-name="div.chips">
      <SpanChip />
      <SpanChip1 />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white border border-[#e7eaf1] border-solid content-stretch flex flex-col items-center justify-center pb-[10px] pt-[9px] px-[10px] relative rounded-[11px] shrink-0" data-name="button">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-black text-center whitespace-nowrap">
        <p className="leading-[normal]">♡ 좋아요</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white border border-[#e7eaf1] border-solid content-stretch flex flex-col items-center justify-center pb-[10px] pt-[9px] px-[10px] relative rounded-[11px] shrink-0" data-name="button">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-black text-center whitespace-nowrap">
        <p className="leading-[normal]">📍 지도 보기</p>
      </div>
    </div>
  );
}

function ButtonPrimary() {
  return (
    <div className="bg-[#6757ff] border border-[#6757ff] border-solid content-stretch flex flex-col items-center justify-center pb-[10px] pt-[9px] px-[10px] relative rounded-[11px] shrink-0" data-name="button.primary">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
        <p className="leading-[normal]">보관</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-white border border-[#e7eaf1] border-solid content-stretch flex flex-col items-center justify-center pb-[10px] pt-[9px] px-[10px] relative rounded-[11px] shrink-0" data-name="button">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-black text-center whitespace-nowrap">
        <p className="leading-[normal]">삭제</p>
      </div>
    </div>
  );
}

function DivMemoActions() {
  return (
    <div className="content-stretch flex gap-[8px] items-start overflow-auto py-[2px] relative shrink-0 w-full" data-name="div.memo-actions">
      <Button />
      <Button1 />
      <ButtonPrimary />
      <Button2 />
    </div>
  );
}

function ArticleMemoCard() {
  return (
    <div className="bg-white border border-[#e7eaf1] border-solid content-stretch flex flex-col gap-[12px] items-start p-[14px] relative rounded-[17px] shrink-0 w-full" data-name="article.memo-card">
      <DivMemoTop />
      <DivMemoContent />
      <DivChips />
      <DivMemoActions />
    </div>
  );
}

function DivTypeIcon1() {
  return (
    <div className="bg-[#ece9ff] content-stretch flex flex-col items-center justify-center pb-[10.5px] pt-[9.5px] relative rounded-[14px] shrink-0 size-[42px]" data-name="div.type-icon">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#171a21] text-[15px] text-center whitespace-nowrap">
        <p className="leading-[normal]">📣</p>
      </div>
    </div>
  );
}

function DivMemoTitle1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pb-[0.8px] right-0 top-[-1px]" data-name="div.memo-title">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:ExtraBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#171a21] text-[16px] whitespace-nowrap">
        <p className="leading-[20.8px]">흑석역 근처</p>
      </div>
    </div>
  );
}

function DivMemoMeta1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[24.8px]" data-name="div.memo-meta">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#707789] text-[12px] whitespace-nowrap">
        <p className="leading-[17.4px]">공지 · 그룹 공개 · 11시간 59분 남음</p>
      </div>
    </div>
  );
}

function Div1() {
  return (
    <div className="h-[43.19px] relative shrink-0 w-[189.14px]" data-name="div">
      <DivMemoTitle1 />
      <DivMemoMeta1 />
    </div>
  );
}

function DivMemoTop1() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-name="div.memo-top">
      <DivTypeIcon1 />
      <Div1 />
    </div>
  );
}

function DivMemoContent1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="div.memo-content">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#171a21] text-[14px] w-full">
        <p className="leading-[23.1px]">오는 사람 있으면 편의점에서 얼음 사오기!</p>
      </div>
    </div>
  );
}

function SpanChip2() {
  return (
    <div className="bg-[#f3f4f8] content-stretch flex flex-col items-start pb-[7px] pt-[6px] px-[8px] relative rounded-[999px] self-stretch shrink-0" data-name="span.chip">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#646b7b] text-[11px] whitespace-nowrap">
        <p className="leading-[normal]">도착 알림</p>
      </div>
    </div>
  );
}

function SpanChip3() {
  return (
    <div className="bg-[#f3f4f8] content-stretch flex flex-col items-start pb-[7px] pt-[6px] px-[8px] relative rounded-[999px] self-stretch shrink-0" data-name="span.chip">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#646b7b] text-[11px] whitespace-nowrap">
        <p className="leading-[normal]">반경 300m</p>
      </div>
    </div>
  );
}

function DivChips1() {
  return (
    <div className="content-stretch flex flex-wrap gap-[0px_6px] h-[27px] items-start pt-px relative shrink-0 w-full" data-name="div.chips">
      <SpanChip2 />
      <SpanChip3 />
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-white border border-[#e7eaf1] border-solid content-stretch flex flex-col items-center justify-center pb-[10px] pt-[9px] px-[10px] relative rounded-[11px] shrink-0" data-name="button">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-black text-center whitespace-nowrap">
        <p className="leading-[normal]">💜 좋아요 취소</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-white border border-[#e7eaf1] border-solid content-stretch flex flex-col items-center justify-center pb-[10px] pt-[9px] px-[10px] relative rounded-[11px] shrink-0" data-name="button">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-black text-center whitespace-nowrap">
        <p className="leading-[normal]">📍 지도 보기</p>
      </div>
    </div>
  );
}

function ButtonPrimary1() {
  return (
    <div className="bg-[#6757ff] border border-[#6757ff] border-solid content-stretch flex flex-col items-center justify-center pb-[10px] pt-[9px] px-[10px] relative rounded-[11px] shrink-0" data-name="button.primary">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
        <p className="leading-[normal]">보관</p>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-white border border-[#e7eaf1] border-solid content-stretch flex flex-col items-center justify-center pb-[10px] pt-[9px] px-[10px] relative rounded-[11px] shrink-0" data-name="button">
      <div className="[word-break:break-word] flex flex-col font-['Apple_SD_Gothic_Neo:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-black text-center whitespace-nowrap">
        <p className="leading-[normal]">삭제</p>
      </div>
    </div>
  );
}

function DivMemoActions1() {
  return (
    <div className="content-stretch flex gap-[8px] items-start overflow-auto py-[2px] relative shrink-0 w-full" data-name="div.memo-actions">
      <Button3 />
      <Button4 />
      <ButtonPrimary1 />
      <Button5 />
    </div>
  );
}

function ArticleMemoCard1() {
  return (
    <div className="bg-white border border-[#e7eaf1] border-solid content-stretch flex flex-col gap-[12px] items-start p-[14px] relative rounded-[17px] shrink-0 w-full" data-name="article.memo-card">
      <DivMemoTop1 />
      <DivMemoContent1 />
      <DivChips1 />
      <DivMemoActions1 />
    </div>
  );
}

function DivMemoList() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="div#memoList">
      <ArticleMemoCard />
      <ArticleMemoCard1 />
    </div>
  );
}

function DivDetailBody() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] h-[510.56px] items-start left-0 pb-[30px] pt-[14px] px-[16px] right-0 top-[83.94px]" data-name="div.detail-body">
      <DivLocationCard />
      <DivMemoList />
    </div>
  );
}

function SectionDetailPanel() {
  return (
    <div className="absolute bg-white inset-[32%_0_0_0] overflow-clip rounded-tl-[28px] rounded-tr-[28px] shadow-[0px_-18px_42px_0px_rgba(31,39,74,0.18)]" data-name="section#detailPanel">
      <BeforeMargin />
      <DivDetailHead />
      <DivDetailBody />
    </div>
  );
}

export default function DivApp() {
  return (
    <div className="bg-white overflow-clip relative rounded-[42px] shadow-[0px_28px_80px_0px_rgba(23,28,48,0.25),0px_0px_0px_8px_#17191f] size-full" data-name="div.app">
      <MainPanel />
      <SectionDetailPanel />
      <div className="-translate-x-1/2 absolute bg-[#17191f] h-[30px] left-1/2 rounded-[20px] top-[10px] w-[112px]" data-name="::before" />
    </div>
  );
}