
import React, { useState } from "react";
import { postChat } from "../api";

export default function Chatbot() {
  const [style, setStyle] = useState("");
  const [region, setRegion] = useState("");
  const [companions, setCompanions] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [selectedTrip, setSelectedTrip] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState<"rec" | "save" | null>(null);

  const handleRecommend = async () => {
    try {
      setLoading("rec");
      setRecommendation("추천 중...");
      const resp = await postChat({ style, region, companions });
      setRecommendation(resp);
    } catch (e: any) {
      setRecommendation(`오류: ${e.message}`);
    } finally {
      setLoading(null);
    }
  };

  const handleSave = async () => {
    try {
      if (!selectedTrip.trim()) {
        setSummary("먼저 추천에서 여행지를 골라 입력해주세요.");
        return;
      }
      setLoading("save");
      setSummary("요약 중...");
      const resp = await postChat({
        style, region, companions,
        selected_trip: selectedTrip.trim(),
      });
      setSummary(resp);
    } catch (e: any) {
      setSummary(`오류: ${e.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">여행 추천 챗봇</h2>

      <label className="block">
        <span className="text-sm">여행 스타일</span>
        <input className="border px-2 py-1 w-full" value={style} onChange={e => setStyle(e.target.value)} placeholder="미니멀/자연/카페투어 등" />
      </label>

      <label className="block">
        <span className="text-sm">희망 지역</span>
        <input className="border px-2 py-1 w-full" value={region} onChange={e => setRegion(e.target.value)} placeholder="일본 도쿄 / 후쿠오카 등" />
      </label>

      <label className="block">
        <span className="text-sm">동행</span>
        <input className="border px-2 py-1 w-full" value={companions} onChange={e => setCompanions(e.target.value)} placeholder="혼자 / 친구 / 가족" />
      </label>

      <button
        onClick={handleRecommend}
        disabled={loading === "rec"}
        className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        {loading === "rec" ? "추천 중..." : "여행지 추천 받기"}
      </button>

      <div>
        <h3 className="font-medium mt-4">추천 결과</h3>
        <textarea className="border w-full h-40 p-2" readOnly value={recommendation} />
      </div>

      <div className="flex gap-2 items-center">
        <input
          className="border px-2 py-1 flex-1"
          placeholder="선택한 여행지(요약용)"
          value={selectedTrip}
          onChange={e => setSelectedTrip(e.target.value)}
        />
        <button
          onClick={handleSave}
          disabled={loading === "save"}
          className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {loading === "save" ? "요약 중..." : "선택 저장 & 요약"}
        </button>
      </div>

      <div>
        <h3 className="font-medium mt-4">요약</h3>
        <pre className="border p-2 whitespace-pre-wrap">{summary}</pre>
      </div>
    </div>
  );
}