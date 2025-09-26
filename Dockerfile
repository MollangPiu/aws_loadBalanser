# Node.js 18 기반 이미지 사용
FROM node:18

# 컨테이너 내부 작업 디렉토리 생성
WORKDIR /usr/src/app

# package.json & package-lock.json 복사 후 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# 애플리케이션이 사용하는 포트 지정
EXPOSE 3000

# 앱 실행
CMD ["node", "server.js"]
