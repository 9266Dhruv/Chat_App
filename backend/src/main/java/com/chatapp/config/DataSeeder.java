package com.chatapp.config;

import com.chatapp.entity.*;
import com.chatapp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded, skipping.");
            return;
        }

        log.info("Seeding database with demo data...");

        // Create 4 users
        User alice = userRepository.save(User.builder()
                .username("alice").email("alice@demo.com").displayName("Alice Johnson")
                .passwordHash(passwordEncoder.encode("password123")).build());

        User bob = userRepository.save(User.builder()
                .username("bob").email("bob@demo.com").displayName("Bob Smith")
                .passwordHash(passwordEncoder.encode("password123")).build());

        User charlie = userRepository.save(User.builder()
                .username("charlie").email("charlie@demo.com").displayName("Charlie Chen")
                .passwordHash(passwordEncoder.encode("password123")).build());

        User diana = userRepository.save(User.builder()
                .username("diana").email("diana@demo.com").displayName("Diana Ross")
                .passwordHash(passwordEncoder.encode("password123")).build());

        // Conversation 1: Alice + Bob (direct)
        Conversation conv1 = Conversation.builder()
                .members(List.of(alice, bob))
                .build();
        conv1 = conversationRepository.save(conv1);

        // Conversation 2: Alice + Charlie (direct)
        Conversation conv2 = Conversation.builder()
                .members(List.of(alice, charlie))
                .build();
        conv2 = conversationRepository.save(conv2);

        // Conversation 3: Group — "Project Alpha"
        Conversation conv3 = Conversation.builder()
                .title("Project Alpha")
                .members(List.of(alice, bob, charlie, diana))
                .build();
        conv3 = conversationRepository.save(conv3);

        // Seed messages for conv1 (Alice + Bob)
        seedMsg(conv1.getId(), alice, "Hey Bob! How's the new feature coming along?");
        seedMsg(conv1.getId(), bob, "Going well! Just finished the API integration.");
        seedMsg(conv1.getId(), alice, "Nice! Can you push it to staging today?");
        seedMsg(conv1.getId(), bob, "Already done. Check it out when you get a chance 🚀");
        seedMsg(conv1.getId(), alice, "Perfect. I'll review it this afternoon.");

        // Seed messages for conv2 (Alice + Charlie)
        seedMsg(conv2.getId(), charlie, "The new authentication flow looks incredibly sharp. Pushing the final assets to the repo now.");
        seedMsg(conv2.getId(), alice, "Perfect. I'll tie in the webhook logic and we're ready for staging. 🚀");
        seedMsg(conv2.getId(), charlie, "Also, I've updated the design tokens. Want me to walk you through?");
        seedMsg(conv2.getId(), alice, "Yes please! Let's sync in 30 minutes.");

        // Seed messages for conv3 (Project Alpha group)
        seedMsg(conv3.getId(), alice, "Team standup notes: we're on track for the Friday demo.");
        seedMsg(conv3.getId(), bob, "Backend APIs are all green. 15 endpoints passing.");
        seedMsg(conv3.getId(), charlie, "I've pushed the new bento grid layouts to staging. The macro architecture feels a lot more solid now.");
        seedMsg(conv3.getId(), diana, "QA is looking good. Found one edge case on mobile that I'll fix today.");
        seedMsg(conv3.getId(), alice, "Great progress everyone! Let's crush it this week. 💪");
        seedMsg(conv3.getId(), bob, "Can someone verify the easing curves on the hover states?");

        log.info("Database seeded with {} users, {} conversations, and messages.",
                userRepository.count(), conversationRepository.count());
    }

    private void seedMsg(Long convId, User sender, String content) {
        messageRepository.save(Message.builder()
                .conversationId(convId)
                .sender(sender)
                .content(content)
                .clientMessageId(UUID.randomUUID().toString())
                .status("SENT")
                .build());
    }
}
