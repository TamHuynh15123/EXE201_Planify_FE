import React from 'react';

const About: React.FC = () => {
  const team = [
    { 
      name: 'Huỳnh Minh Tâm', 
      role: 'PROJECT LEADER', 
      image: '/PlanifyImg/Home/Avatar1.png', 
      bio: 'Quản lý dự án có kinh nghiệm với đam mê xây dựng các giải pháp tự động hóa.',
      position: 'object-[center_20%]' 
    },
    { 
      name: 'Ông Quốc Đạt', 
      role: 'DEVOOP', 
      image: '/PlanifyImg/Home/Avatar2.png', 
      bio: 'Lập trình viên backend chuyên về kiến trúc ứng dụng và tối ưu hóa hệ thống.',
      position: 'object-[center_15%]'
    },
    { 
      name: 'Nguyễn Đăng Khoa', 
      role: 'DEVBE', 
      image: '/PlanifyImg/Home/Avatar3.png', 
      bio: 'Backend developer tỉ mẩn, chuyên phát triển API và tích hợp cơ sở dữ liệu.',
      position: 'object-[center_25%]'
    },
    { 
      name: 'Nguyễn Đăng Khoa', 
      role: 'UX/UI DESIGNER', 
      image: '/PlanifyImg/Home/Avatar4.png', 
      bio: 'Nhà thiết kế UX/UI sáng tạo, mang đến cho web các trải nghiệm tuyệt vời.',
      position: 'object-center'
    },
    { 
      name: 'Trịnh Nguyễn Bảo Duy', 
      role: 'DEVFE', 
      image: '/PlanifyImg/Home/Avatar6.png', 
      bio: 'Frontend developer giỏi, chuyên xây dựng giao diện người dùng hiện đại.',
      position: 'object-center'
    },
    { 
      name: 'Lê Quốc Minh', 
      role: 'DEVAI', 
      image: '/PlanifyImg/Home/Avatar5.png', 
      bio: 'AI/ML engineer, chuyên phát triển các mô hình AI cho lập kế hoạch tự động.',
      position: 'object-center'
    }
  ];

  const values = [
    { 
      title: 'Tập trung vào người dùng', 
      desc: 'Chúng tôi luôn đặt nhu cầu của người dùng lên hàng đầu trong mỗi quyết định thiết kế và phát triển.'
    },
    { 
      title: 'Sáng tạo liên tục', 
      desc: 'Chúng tôi không bao giờ ngừng tìm kiếm những cách mới để cải thiện sản phẩm và dịch vụ của chúng tôi.'
    },
    { 
      title: 'Làm việc nhóm', 
      desc: 'Sức mạnh của chúng tôi nằm ở khả năng cộng tác hiệu quả và hỗ trợ lẫn nhau để đạt mục tiêu chung.'
    }
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white font-sans">
      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#4c6ef5] mb-20 mt-10">Gặp gỡ đội ngũ của chúng tôi</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {team.map((member, idx) => (
            <div key={idx} className="flex flex-col rounded-3xl overflow-hidden shadow-sm bg-[#e9ecef]/30 group">
              {/* Blue Header with Large Centered Avatar */}
              <div className="bg-[#6366f1] h-56 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent opacity-30" />
                <div className="relative w-44 h-44 rounded-full border-8 border-white/20 shadow-2xl overflow-hidden bg-gray-100">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className={`w-full h-full object-cover ${member.position} transition-transform duration-500 group-hover:scale-110`}
                  />
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8 text-left bg-white flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-[#6366f1] font-bold text-sm tracking-wider mb-4 uppercase">{member.role}</p>
                <p className="text-gray-600 leading-relaxed font-medium">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#4c6ef5] mb-4">Giá trị cốt lõi của chúng tôi</h2>
          <p className="text-gray-500 mb-20 font-medium">Ba nguyên tắc hướng dẫn mọi quyết định và hành động của chúng tôi</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {values.map((value, idx) => (
              <div key={idx} className="relative group">
                {/* Background Blue Accent */}
                <div className="absolute -inset-1 bg-[#6366f1] rounded-3xl opacity-100 -z-10 transform translate-y-2" />
                
                {/* Main Card */}
                <div className="bg-[#e9ecef] p-10 rounded-3xl text-left h-full border border-gray-200">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
                    {value.title.split(' ').map((word, i) => (
                      <React.Fragment key={i}>
                        {word} {i === 1 && <br />}
                      </React.Fragment>
                    ))}
                  </h4>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    {value.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
