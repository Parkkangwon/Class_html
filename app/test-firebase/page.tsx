'use client';

import { useEffect, useState } from 'react';
import { getFirestoreDB } from '@/lib/firebase/config';
import { collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';

export default function TestFirebase() {
  const [status, setStatus] = useState('Firebase 연결 테스트 중...');
  const [testData, setTestData] = useState<any>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const db = getFirestoreDB();
        if (!db) {
          throw new Error('Firestore DB가 초기화되지 않았습니다.');
        }

        // 테스트 컬렉션 참조
        const testRef = collection(db, '_test');
        const testDocRef = doc(testRef, 'connection');
        
        // 테스트 데이터 작성
        const testData = {
          message: 'Firestore 연결 테스트',
          timestamp: new Date().toISOString(),
          status: 'success'
        };

        // 데이터 쓰기
        await setDoc(testDocRef, testData);
        
        // 데이터 읽기
        const docSnap = await getDoc(testDocRef);
        
        if (docSnap.exists()) {
          setTestData(docSnap.data());
          setStatus('✅ Firebase Firestore 연결 성공!');
        } else {
          setStatus('❌ 데이터를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('Firebase 연결 테스트 실패:', error);
        setStatus(`❌ Firebase 연결 실패: ${error.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Firebase 연결 테스트</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">연결 상태</h2>
        <p className="mb-4">{status}</p>
        
        {testData && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">테스트 데이터:</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h2 className="text-lg font-semibold mb-2">문제 해결 가이드</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Firebase 콘솔에서 Firestore 데이터베이스가 생성되어 있는지 확인하세요.</li>
          <li>Firestore 보안 규칙이 테스트 데이터 읽기/쓰기를 허용하는지 확인하세요.</li>
          <li>브라우저의 개발자 도구(F12) 콘솔에서 추가 오류 메시지가 있는지 확인하세요.</li>
        </ul>
      </div>
    </div>
  );
}
